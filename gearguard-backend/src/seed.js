require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Team = require('./models/Team');
const Equipment = require('./models/Equipment');
const Request = require('./models/Request');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to DB:', error);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        // Clear existing data
        await User.deleteMany();
        await Team.deleteMany();
        await Equipment.deleteMany();
        await Request.deleteMany();
        console.log('Data destroyed...');

        // 1. Create Users
        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@gearguard.com',
                password: 'password123',
                role: 'admin'
            },
            {
                name: 'Manager Mike',
                email: 'manager@gearguard.com',
                password: 'password123',
                role: 'manager'
            },
            {
                name: 'Tech Tony',
                email: 'tech@gearguard.com',
                password: 'password123',
                role: 'technician'
            },
            {
                name: 'Requester Rachel',
                email: 'requester@gearguard.com',
                password: 'password123',
                role: 'requester'
            }
        ]);

        const [admin, manager, technician, requester] = users;
        console.log('Users created...');

        // 2. Create Teams
        const team = await Team.create({
            name: 'Alpha Maintenance',
            members: [technician._id, manager._id]
        });
        console.log('Teams created...');

        // 3. Create Equipment
        const equipment = await Equipment.create({
            name: 'Hydraulic Press',
            serialNumber: 'HP-2025-001',
            department: 'Manufacturing',
            location: 'Floor 1, Zone A',
            purchaseDate: new Date('2023-01-15'),
            warrantyEnd: new Date('2026-01-15'),
            assignedTeam: team._id,
            defaultTechnician: technician._id,
            status: 'active'
        });
        console.log('Equipment created...');

        // 4. Create Requests
        await Request.create([
            {
                subject: 'Leaking Oil',
                equipment: equipment._id,
                team: team._id,
                technician: technician._id,
                type: 'corrective',
                stage: 'new',
                createdBy: requester._id
            },
            {
                subject: 'Monthly Inspection',
                equipment: equipment._id,
                team: team._id,
                technician: technician._id,
                type: 'preventive',
                stage: 'in_progress',
                scheduledDate: new Date(new Date().setDate(new Date().getDate() + 5)), // 5 days from now
                createdBy: manager._id
            },
            {
                subject: 'Overdue Maintenance',
                equipment: equipment._id,
                team: team._id,
                technician: technician._id,
                type: 'preventive',
                stage: 'new',
                scheduledDate: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 days ago (Overdue)
                createdBy: manager._id
            }
        ]);
        console.log('Requests created...');

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
