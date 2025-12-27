const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: [true, 'Please add a subject']
    },
    description: {
        type: String,
    },
    equipment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment',
        required: true
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    technician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['corrective', 'preventive'],
        required: true
    },
    urgency: {
        type: String,
        enum: ['low', 'normal', 'high'],
        default: 'normal'
    },
    stage: {
        type: String,
        enum: ['new', 'in_progress', 'repaired', 'scrap'],
        default: 'new'
    },
    scheduledDate: {
        type: Date,
        index: true
    },
    duration: {
        type: Number, // in minutes/hours? Assuming hours or user defined. Let's say minutes for now or just number.
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Reverse populate with virtuals if needed, or just computed property
requestSchema.virtual('isOverdue').get(function () {
    // If scheduledDate exists, stage is not repaired, and scheduledDate is in the past
    if (!this.scheduledDate) return false;
    if (this.stage === 'repaired') return false;
    return this.scheduledDate < new Date();
});

module.exports = mongoose.model('Request', requestSchema);
