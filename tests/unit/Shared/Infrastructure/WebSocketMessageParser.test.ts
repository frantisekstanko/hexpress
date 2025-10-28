import { WebSocketMessageParser } from '@/Core/Infrastructure/WebSocket/WebSocketMessageParser'

describe('WebSocketMessageParser', () => {
  let parser: WebSocketMessageParser

  beforeEach(() => {
    parser = new WebSocketMessageParser()
  })

  describe('parseMessage', () => {
    it('should parse valid JSON from Buffer', () => {
      const jsonObject = { type: 'message', data: 'test' }
      const buffer = Buffer.from(JSON.stringify(jsonObject), 'utf8')

      const result = parser.parseMessage(buffer)

      expect(result).toEqual(jsonObject)
    })

    it('should parse valid JSON from ArrayBuffer', () => {
      const jsonObject = { type: 'event', payload: { id: 123 } }
      const jsonString = JSON.stringify(jsonObject)
      const buffer = Buffer.from(jsonString, 'utf8')
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      )

      const result = parser.parseMessage(arrayBuffer)

      expect(result).toEqual(jsonObject)
    })

    it('should parse valid JSON from Buffer array', () => {
      const jsonObject = { action: 'update' }
      const jsonString = JSON.stringify(jsonObject)
      const buffer = Buffer.from(jsonString, 'utf8')
      const bufferArray = [buffer]

      const result = parser.parseMessage(bufferArray)

      expect(result).toEqual(jsonObject)
    })

    it('should handle complex nested JSON objects', () => {
      const complexObject = {
        type: 'complex',
        nested: {
          data: {
            array: [1, 2, 3],
            string: 'test',
            boolean: true,
          },
        },
      }
      const buffer = Buffer.from(JSON.stringify(complexObject), 'utf8')

      const result = parser.parseMessage(buffer)

      expect(result).toEqual(complexObject)
    })

    it('should handle empty JSON object', () => {
      const buffer = Buffer.from('{}', 'utf8')

      const result = parser.parseMessage(buffer)

      expect(result).toEqual({})
    })

    it('should throw error for invalid JSON', () => {
      const buffer = Buffer.from('invalid json', 'utf8')

      expect(() => parser.parseMessage(buffer)).toThrow()
    })

    it('should handle UTF-8 encoded strings', () => {
      const jsonObject = { message: 'گچپژ' }
      const buffer = Buffer.from(JSON.stringify(jsonObject), 'utf8')

      const result = parser.parseMessage(buffer)

      expect(result).toEqual(jsonObject)
    })
  })
})
