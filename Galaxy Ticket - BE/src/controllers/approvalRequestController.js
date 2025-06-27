const ApprovalRequest = require("../models/ApprovalRequest");
const Movie = require("../models/Movie");

const getAllRequests = async (req, res) => {
  try {
    const { type, status } = req.query;
    let query = {};

    if (type) query.type = type;
    if (status) query.status = status;

    const requests = await ApprovalRequest.find(query)
      .sort({ createdAt: -1 })
      .populate("staffId", "name email")
      .populate("managerId", "name email");

    res.status(200).json({
      success: true,
      message: "Get all approval requests successfully",
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRequestById = async (req, res) => {
  try {
    const request = await ApprovalRequest.findById(req.params.id)
      .populate("staffId", "name email")
      .populate("managerId", "name email");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Approval request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Get approval request successfully",
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateRequest = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const managerId = req.user.userId;
    const request = await ApprovalRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Approval request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Request is not pending",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required when rejecting a request",
      });
    }

    switch (request.type) {
      case "movie":
        const existingMovie = await Movie.findById(request.referenceId);
        if (!existingMovie) {
          return res.status(404).json({
            success: false,
            message: "Referenced movie not found",
          });
        }

        existingMovie.title = request.requestData.title;
        existingMovie.description = request.requestData.description;
        existingMovie.duration = request.requestData.duration;
        existingMovie.posterUrl = request.requestData.posterUrl;
        existingMovie.trailerUrl = request.requestData.trailerUrl;
        existingMovie.country = request.requestData.country;
        existingMovie.showingStatus = request.requestData.showingStatus;
        existingMovie.producer = request.requestData.producer;
        existingMovie.directors = request.requestData.directors;
        existingMovie.actors = request.requestData.actors;

        existingMovie.status = status;
        existingMovie.approvedBy = managerId;
        existingMovie.rejectionReason =
          status === "rejected" ? rejectionReason : null;

        const updatedMovie = await existingMovie.save({
          validateBeforeSave: false,
        });

        request.status = status;
        request.managerId = managerId;
        request.rejectionReason =
          status === "rejected" ? rejectionReason : null;
        request.requestData = updatedMovie;
        break;

      // 6. Chuẩn bị cho tương lai khi thêm các loại request khác
      case "promotion":
        const Promotion = require("../models/Promotion");
        const updatedPromotion = await Promotion.findByIdAndUpdate(
          request.referenceId,
          {
            status: status,
            approvedBy: managerId,
            rejectionReason: status === "rejected" ? rejectionReason : null,
          },
          { new: true }
        );

        if (!updatedPromotion) {
          return res.status(404).json({
            success: false,
            message: "Referenced promotion not found",
          });
        }

        request.status = status;
        request.managerId = managerId;
        request.rejectionReason =
          status === "rejected" ? rejectionReason : null;
        request.requestData = updatedPromotion;
        break;

      case "screening":
        const Screening = require("../models/Screening");
        // Cập nhật trạng thái
        await Screening.findByIdAndUpdate(request.referenceId, {
          status: status,
          approvedBy: managerId,
          rejectionReason: status === "rejected" ? rejectionReason : null,
        });

        // Lấy lại bản ghi đã populate
        const populatedScreening = await Screening.findById(request.referenceId)
          .populate("movieId", "title")
          .populate("roomId", "name")
          .populate("theaterId", "name");

        if (!populatedScreening) {
          return res.status(404).json({
            success: false,
            message: "Referenced screening not found",
          });
        }

        // Nhúng tên phim/phòng/rạp vào requestData
        const screeningData = populatedScreening.toObject();
        screeningData.movieTitle = populatedScreening.movieId?.title || null;
        screeningData.roomName = populatedScreening.roomId?.name || null;
        screeningData.theaterName = populatedScreening.theaterId?.name || null;

        request.status = status;
        request.managerId = managerId;
        request.rejectionReason =
          status === "rejected" ? rejectionReason : null;
        request.requestData = screeningData;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid request type",
        });
    }

    await request.save();

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      data: request,
    });
  } catch (error) {
    console.error("Error in updateRequest:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  getAllRequests,
  getRequestById,
  updateRequest,
};
