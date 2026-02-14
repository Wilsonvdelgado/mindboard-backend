import { DataSource } from 'typeorm';
// import { User, UserRole } from '../users/user.entity';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';

async function runAdminSeed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5433,
    username: 'postgres',
    password: '1234',
    database: 'mindboarddb',
    entities: [User],
    synchronize: true, // apenas dev
  });

  await dataSource.initialize();
  console.log('DataSource initialized');

  const userRepository = dataSource.getRepository(User);

  // Verifica se já existe o admin
  const existingAdmin = await userRepository.findOneBy({
    email: 'admin@mindboardips.com',
  });
  if (existingAdmin) {
    console.log('Admin já existe');
    await dataSource.destroy();
    return;
  }

  // Criptografar a senha
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = userRepository.create({
    name: 'Admin',
    email: 'admin@mindboardips.com',
    password: hashedPassword,
    role: UserRole.ADMIN,
  });

  await userRepository.save(admin);
  console.log('Admin criado com sucesso!');

  await dataSource.destroy();
}

runAdminSeed().catch((err) => {
  console.error(err);
  process.exit(1);
});
