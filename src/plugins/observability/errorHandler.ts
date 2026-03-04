import fp from 'fastify-plugin'
import { FastifyPluginAsync, FastifyError } from 'fastify'

const errorHandlerPlugin: FastifyPluginAsync = fp(async (server) => {
  server.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = error.statusCode ?? 500
    const correlationId = request.correlationId

    if (statusCode >= 500) {
      request.log.error({ err: error, correlationId }, 'Unhandled error')
      return reply.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        correlationId,
      })
    }

    // 4xx — operational errors (validation, notFound, badRequest, etc.)
    return reply.code(statusCode).send({
      statusCode,
      error: error.name,
      message: error.message,
      correlationId,
      ...(error.validation ? { validation: error.validation } : {}),
    })
  })
})

export default errorHandlerPlugin
