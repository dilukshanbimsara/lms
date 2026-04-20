"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const hashedPassword = await bcrypt.hash('Admin@1234', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@tutiolms.lk' },
        update: { password: hashedPassword },
        create: {
            email: 'admin@tutiolms.lk',
            password: hashedPassword,
            name: 'Mr. Kamal Perera',
            phone: '+94 77 123 4567',
            role: 'SUPER_ADMIN',
        },
    });
    console.log('Seeded admin user:', admin.email);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map