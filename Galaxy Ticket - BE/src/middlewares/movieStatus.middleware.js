const Movie = require('../models/Movie');


const updateMovieShowingStatus = async (req, res, next) => {
    try {
        const now = new Date();
        console.log('Middleware - Current date:', now);
        
        // Cập nhật phim từ coming-soon sang now-showing khi đến ngày khởi chiếu
        const resultToNowShowing = await Movie.updateMany(
            {
                releaseDate: { $lte: now },        
                showingStatus: 'coming-soon',       
                status: 'approved',                 
                isActive: true                    
            },
            { 
                $set: { showingStatus: 'now-showing' }
            }
        );

        if (resultToNowShowing.modifiedCount > 0) {
            console.log(`Updated ${resultToNowShowing.modifiedCount} movies to now-showing`);
        }
        
        // Sửa lại điều kiện để tránh ghi đè
        const resultToEnded = await Movie.updateMany(
            {
                endDate: { $lte: now, $ne: null }, // Kết hợp hai điều kiện
                showingStatus: 'now-showing',
                status: 'approved',
                isActive: true
            },
            {
                $set: { showingStatus: 'ended' }
            }
        );
        
        if (resultToEnded.modifiedCount > 0) {
            console.log(`Updated ${resultToEnded.modifiedCount} movies to ended`);
        }

        next();
    } catch (error) {
        console.error('Error updating movie status:', error);
        next(error);
    }
};

module.exports = { updateMovieShowingStatus };