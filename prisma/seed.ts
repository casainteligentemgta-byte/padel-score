import { PrismaClient, TournamentType, TournamentCategory } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const complex = await prisma.complex.upsert({
        where: { id: 'default-complex' },
        update: {},
        create: {
            id: 'default-complex',
            name: 'Padel Pro Center',
            location: 'Madrid, España',
            courts: {
                create: [
                    { name: 'Pista 1 (Panorámica)' },
                    { name: 'Pista 2' },
                    { name: 'Pista 3' },
                    { name: 'Pista 4' },
                ],
            },
        },
    })

    console.log({ complex })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
