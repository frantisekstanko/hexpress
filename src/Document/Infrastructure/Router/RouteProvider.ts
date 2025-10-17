import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { RouteProviderInterface } from '@/Core/Application/Router/RouteProviderInterface'
import { CreateDocumentController } from '@/Document/Infrastructure/CreateDocumentController'
import { DeleteDocumentController } from '@/Document/Infrastructure/DeleteDocumentController'
import { ListDocumentsController } from '@/Document/Infrastructure/ListDocumentsController'

export class RouteProvider implements RouteProviderInterface {
  getRoutes(): RouteConfig[] {
    return [
      {
        method: 'post',
        path: '/api/v1/document',
        controller: CreateDocumentController,
        public: false,
      },
      {
        method: 'get',
        path: '/api/v1/documents',
        controller: ListDocumentsController,
        public: false,
      },
      {
        method: 'delete',
        path: '/api/v1/document/:id',
        controller: DeleteDocumentController,
        public: false,
      },
    ]
  }
}
