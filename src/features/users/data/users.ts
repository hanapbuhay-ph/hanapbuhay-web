import { faker } from '@faker-js/faker'
import { type User, type UserRole } from '../types'

// Set a fixed seed for consistent data generation
faker.seed(67890)

export const users: User[] = Array.from({ length: 500 }, (_, index) => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    id: index + 1,
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName }).toLocaleLowerCase(),
    role: faker.helpers.arrayElement<UserRole>([
      'client',
      'worker',
      'admin',
      'super_admin',
    ]),
    barangay: faker.location.county(),
    is_active: faker.datatype.boolean(),
    created_at: faker.date.past().toISOString(),
  }
})
