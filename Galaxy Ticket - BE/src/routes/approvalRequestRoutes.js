const express = require('express');
const router = express.Router();
const approvalRequestController = require('../controllers/approvalRequestController');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');


router.get('/', 
  authenticate, 
  authorizeRoles("manager"), 
  approvalRequestController.getAllRequests
);


router.get('/:id', 
  authenticate, 
  authorizeRoles("manager"), 
  approvalRequestController.getRequestById
);

router.put('/:id', 
  authenticate, 
  authorizeRoles("manager"), 
  approvalRequestController.updateRequest
);

module.exports = router;