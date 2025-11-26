# Performance & Monitoring

## Performance Metrics

```typescript
// Response interface with timing metrics
interface PerformanceMetrics {
  total_duration: number      // Total response time (nanoseconds)
  load_duration: number       // Model loading time (nanoseconds)
  prompt_eval_count: number   // Input tokens processed
  prompt_eval_duration: number // Prompt evaluation time (nanoseconds)
  eval_count: number          // Output tokens generated
  eval_duration: number       // Output generation time (nanoseconds)
}

// Calculate response time in milliseconds
function calculateResponseTime(metrics: PerformanceMetrics): number {
  return metrics.total_duration / 1_000_000 // Convert nanoseconds to ms
}

// Calculate tokens per second
function calculateTokensPerSecond(metrics: PerformanceMetrics): number {
  const evalTimeMs = metrics.eval_duration / 1_000_000
  return (metrics.eval_count / evalTimeMs) * 1000
}
```

## Streaming vs Non-Streaming Performance

```typescript
// Non-streaming response processing
async function handleNonStreamingResponse(response: any) {
  const metrics = {
    total_duration: response.total_duration,
    eval_duration: response.eval_duration,
    eval_count: response.eval_count
  }

  console.log(`Response time: ${calculateResponseTime(metrics)}ms`)
  console.log(`Tokens/sec: ${calculateTokensPerSecond(metrics)}`)
}

// Streaming response processing
async function handleStreamingResponse(stream: AsyncIterable<any>) {
  let totalChunks = 0
  const startTime = Date.now()

  for await (const chunk of stream) {
    totalChunks++
    if (chunk.done) {
      const metrics = {
        total_duration: chunk.total_duration,
        eval_duration: chunk.eval_duration,
        eval_count: chunk.eval_count
      }

      const actualTime = Date.now() - startTime
      console.log(`Chunks: ${totalChunks}, Time: ${actualTime}ms`)
    }
  }
}
```

## Performance Optimization Patterns

```typescript
// Optimize for sub-1s responses
interface OptimizationConfig {
  temperature: number        // Lower = more deterministic, faster
  top_p: number             // Nucleus sampling
  top_k: number            // Limit token selection
  num_predict: number       // Limit output length
}

const fastConfig: OptimizationConfig = {
  temperature: 0,
  top_p: 0.9,
  top_k: 40,
  num_predict: 100
}

// Use optimized config for fast responses
const response = await ollama.chat({
  model: 'llama3.2:1b',
  messages: [{ role: 'user', content: prompt }],
  options: fastConfig
})
```