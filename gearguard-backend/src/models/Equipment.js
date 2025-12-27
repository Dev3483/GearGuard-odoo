const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add equipment name']
    },
    serialNumber: {
        type: String,
        required: [true, 'Please add serial number'],
        unique: true,
        index: true
    },
    department: {
        type: String,
        required: [true, 'Please add department']
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    location: {
        type: String,
        required: [true, 'Please add location']
    },
    purchaseDate: {
        type: Date,
        required: [true, 'Please add purchase date']
    },
    warrantyEnd: {
        type: Date
    },
    assignedTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    defaultTechnician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['active', 'scrapped', 'archived'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Equipment', equipmentSchema);
