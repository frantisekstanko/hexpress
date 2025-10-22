import { createServiceToken } from '@/Core/Application/ServiceToken'
import { DocumentsRepositoryInterface } from '@/Document/Application/DocumentsRepositoryInterface'
import { DocumentRepositoryInterface } from '@/Document/Domain/DocumentRepositoryInterface'

export const Services = {
  DocumentRepositoryInterface: createServiceToken<DocumentRepositoryInterface>(
    'DocumentRepositoryInterface',
  ),
  DocumentsRepositoryInterface:
    createServiceToken<DocumentsRepositoryInterface>(
      'DocumentsRepositoryInterface',
    ),
}
