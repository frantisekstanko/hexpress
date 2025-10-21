import { NextFunction, Request, Response } from 'express'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { ControllerResolverInterface } from '@/Core/Application/Controller/ControllerResolverInterface'
import { RouteProviderInterface } from '@/Core/Application/Router/RouteProviderInterface'
import { PublicRouteSecurityPolicy } from '@/Core/Infrastructure/Router/PublicRouteSecurityPolicy'
import { Router } from '@/Core/Infrastructure/Router/Router'

class TestController implements ControllerInterface {
  async handle(): Promise<void> {}
}

describe('Router', () => {
  let controllerResolver: jest.Mocked<ControllerResolverInterface>
  let routeProvider: jest.Mocked<RouteProviderInterface>

  beforeEach(() => {
    controllerResolver = {
      resolve: jest.fn(),
      has: jest.fn(),
    } as jest.Mocked<ControllerResolverInterface>

    routeProvider = {
      getRoutes: jest.fn(),
    } as jest.Mocked<RouteProviderInterface>
  })

  it('should return 404 when controller is not registered (has returns false)', async () => {
    routeProvider.getRoutes.mockReturnValue([
      {
        method: 'get',
        path: '/test',
        controller: TestController,
        securityPolicy: new PublicRouteSecurityPolicy(),
      },
    ])

    controllerResolver.has.mockReturnValue(false)

    const router = new Router(controllerResolver, routeProvider)

    const expressRouter = router.getRouter()

    const mockRequest = {} as Request
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response
    const mockNext = jest.fn() as NextFunction

    const route = expressRouter.stack.find(
      (layer) => layer.route?.path === '/test',
    )
    if (route?.route) {
      await route.route.stack[0].handle(mockRequest, mockResponse, mockNext)
    }

    expect(mockResponse.status).toHaveBeenCalledWith(404)
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Controller not registered in the container',
      }),
    )
  })

  it('should return 404 when controller resolve returns null', async () => {
    routeProvider.getRoutes.mockReturnValue([
      {
        method: 'get',
        path: '/test',
        controller: TestController,
        securityPolicy: new PublicRouteSecurityPolicy(),
      },
    ])

    controllerResolver.has.mockReturnValue(true)
    controllerResolver.resolve.mockReturnValue(null)

    const router = new Router(controllerResolver, routeProvider)

    const expressRouter = router.getRouter()

    const mockRequest = {} as Request
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response
    const mockNext = jest.fn() as NextFunction

    const route = expressRouter.stack.find(
      (layer) => layer.route?.path === '/test',
    )
    if (route?.route) {
      await route.route.stack[0].handle(mockRequest, mockResponse, mockNext)
    }

    expect(mockResponse.status).toHaveBeenCalledWith(404)
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Controller not registered in the container',
      }),
    )
  })

  it('should call next with error when controller throws', async () => {
    const testError = new Error('Controller error')
    const mockController: ControllerInterface = {
      handle: jest.fn().mockRejectedValue(testError),
    }

    routeProvider.getRoutes.mockReturnValue([
      {
        method: 'get',
        path: '/test',
        controller: TestController,
        securityPolicy: new PublicRouteSecurityPolicy(),
      },
    ])

    controllerResolver.has.mockReturnValue(true)
    controllerResolver.resolve.mockReturnValue(mockController)

    const router = new Router(controllerResolver, routeProvider)

    const expressRouter = router.getRouter()

    const mockRequest = {} as Request
    const mockResponse = {} as Response
    const mockNext = jest.fn() as NextFunction

    const route = expressRouter.stack.find(
      (layer) => layer.route?.path === '/test',
    )
    if (route?.route) {
      await route.route.stack[0].handle(mockRequest, mockResponse, mockNext)
    }

    expect(mockNext).toHaveBeenCalledWith(testError)
  })
})
