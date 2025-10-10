import { DocumentRepositoryInterface } from '@/Document/Domain/DocumentRepositoryInterface'

export class MockDocumentRepository implements DocumentRepositoryInterface {
  save = jest.fn()
  getById = jest.fn()
  delete = jest.fn()
  deleteAllByUserId = jest.fn()
}
