"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma_1 = __importDefault(require("./lib/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function main() {
    console.log('Starting debug script...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not Set');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
    try {
        console.log('Testing DB connection...');
        const users = await prisma_1.default.user.findMany({ take: 1 });
        console.log('DB Connection successful. Users found:', users.length);
        if (users.length > 0) {
            const user = users[0];
            console.log('Testing login flow for user:', user.email);
            // Test findUnique
            console.log('Testing findUnique...');
            const foundUser = await prisma_1.default.user.findUnique({ where: { email: user.email } });
            console.log('User found:', foundUser ? 'Yes' : 'No');
            if (foundUser) {
                // Test bcrypt
                console.log('Testing bcrypt...');
                // We don't know the password, but we want to ensure it doesn't THROW
                const isMatch = await bcryptjs_1.default.compare('somepassword', foundUser.password);
                console.log('Bcrypt compare result (should be false):', isMatch);
                // Test JWT
                console.log('Testing JWT sign...');
                const token = jsonwebtoken_1.default.sign({ userId: foundUser.id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
                console.log('JWT signed successfully');
            }
        }
        else {
            console.log('No users found. Creating a dummy user for testing...');
            // Create a dummy user
            const hashedPassword = await bcryptjs_1.default.hash('testpassword', 10);
            const newUser = await prisma_1.default.user.create({
                data: {
                    email: 'debug_test@example.com',
                    password: hashedPassword,
                    name: 'Debug User'
                }
            });
            console.log('Dummy user created:', newUser.email);
            // Now test login with this user
            console.log('Testing bcrypt with correct password...');
            const isMatch = await bcryptjs_1.default.compare('testpassword', newUser.password);
            console.log('Bcrypt compare result (should be true):', isMatch);
        }
    }
    catch (error) {
        console.error('ERROR CAUGHT:', error);
    }
    finally {
        await prisma_1.default.$disconnect();
    }
}
main();
