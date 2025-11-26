# API Design Patterns

## Core Request Interfaces

```typescript
// Chat Request Pattern
interface ChatRequest {
  model: string
  messages: Message[]
  stream?: boolean
  format?: string | object
  tools?: Tool[]
  think?: boolean | 'high' | 'medium' | 'low'
  options?: Partial<Options>
}

// Generate Request Pattern
interface GenerateRequest {
  model: string
  prompt: string
  stream?: boolean
  format?: string | object
  think?: boolean | 'high' | 'medium' | 'low'
  options?: Partial<Options>
}

// Message Pattern
interface Message {
  role: string
  content: string
  thinking?: string
  images?: Uint8Array[] | string[]
  tool_calls?: ToolCall[]
}
```

## Error Handling Pattern

```typescript
class ResponseError extends Error {
  constructor(
    public error: string,
    public status_code: number,
  ) {
    super(error)
    this.name = 'ResponseError'
  }
}

// Usage in API calls
const checkOk = async (response: Response): Promise<void> => {
  if (!response.ok) {
    let message = `Error ${response.status}: ${response.statusText}`
    throw new ResponseError(message, response.status)
  }
}
```

## Streaming Pattern

```typescript
export class AbortableAsyncIterator<T extends object> {
  private readonly abortController: AbortController

  abort() {
    this.abortController.abort()
  }

  async *[Symbol.asyncIterator]() {
    for await (const message of this.itr) {
      if ('error' in message) {
        throw new Error(message.error)
      }
      yield message
      if ((message as any).done) {
        return
      }
    }
  }
}
```

## Connection Management

```typescript
// Host formatting
export const formatHost = (host: string): string => {
  if (!host) return defaultHost

  let isExplicitProtocol = host.includes('://')
  if (!isExplicitProtocol) host = `http://${host}`

  const url = new URL(host)
  let port = url.port || (url.protocol === 'https:' ? '443' : '80')

  return `${url.protocol}//${url.hostname}:${port}${url.pathname}`.replace(/\/$/, '')
}

// Headers normalization
function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (headers instanceof Headers) {
    const obj: Record<string, string> = {}
    headers.forEach((value, key) => obj[key] = value)
    return obj
  }
  return headers || {}
}
```