import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { RouteProviderInterface } from '@/Core/Application/Router/RouteProviderInterface'
import { AuthenticatedRouteSecurityPolicy } from '@/Core/Infrastructure/Router/AuthenticatedRouteSecurityPolicy'
import { CreateDocumentController } from '@/Document/Infrastructure/CreateDocumentController'
import { DeleteDocumentController } from '@/Document/Infrastructure/DeleteDocumentController'
import { ListDocumentsController } from '@/Document/Infrastructure/ListDocumentsController'

export class RouteProvider implements RouteProviderInterface {
  constructor(
    private readonly authenticatedRouteSecurityPolicy: AuthenticatedRouteSecurityPolicy,
  ) {}

  getRoutes(): RouteConfig[] {
    return [
      {
        method: 'post',
        path: '/api/v1/document',
        controller: CreateDocumentController,
        securityPolicy: this.authenticatedRouteSecurityPolicy,
      },
      {
        method: 'get',
        path: '/api/v1/documents',
        controller: ListDocumentsController,
        securityPolicy: this.authenticatedRouteSecurityPolicy,
      },
      {
        method: 'delete',
        path: '/api/v1/document/:id',
        controller: DeleteDocumentController,
        securityPolicy: this.authenticatedRouteSecurityPolicy,
      },
    ]
  }
}
