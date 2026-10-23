import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import 'dotenv/config';

import dataSource from '../data-source';

async function runAdminSeed() {
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
    status: UserStatus.ACTIVE,
  });

  await userRepository.save(admin);
  console.log('Admin criado com sucesso!');

  await dataSource.destroy();
}

runAdminSeed().catch((err) => {
  console.error(err);
  process.exit(1);
});
