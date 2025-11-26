// Tool definition for add function
const addTwoNumbersTool = {
    type: 'function',
    function: {
        name: 'addTwoNumbers',
        description: 'Add two numbers together',
        parameters: {
            type: 'object',
            required: ['a', 'b'],
            properties: {
                a: { type: 'number', description: 'The first number' },
                b: { type: 'number', description: 'The second number' }
            }
        }
    }
};

// Tool definition for subtract function
const subtractTwoNumbersTool = {
    type: 'function',
    function: {
        name: 'subtractTwoNumbers',
        description: 'Subtract two numbers',
        parameters: {
            type: 'object',
            required: ['a', 'b'],
            properties: {
                a: { type: 'number', description: 'The first number' },
                b: { type: 'number', description: 'The second number' }
            }
        }
    }
};

async function run(model: string) {
    const messages = [{ role: 'user', content: 'What is three minus one?' }];
    console.log('Prompt:', messages[0].content);

    const availableFunctions = {
        addTwoNumbers: addTwoNumbers,
        subtractTwoNumbers: subtractTwoNumbers
    };

    const response = await ollama.chat({
        model: model,
        messages: messages,
        tools: [addTwoNumbersTool, subtractTwoNumbersTool]
    });

    let output: number;
    if (response.message.tool_calls) {
        // Process tool calls from the response
        for (const tool of response.message.tool_calls) {
            const functionToCall = availableFunctions[tool.function.name];
            if (functionToCall) {
                console.log('Calling function:', tool.function.name);
                console.log('Arguments:', tool.function.arguments);
                output = functionToCall(tool.function.arguments);
                console.log('Function output:', output);

                // Add the function response to messages for the model to use
                messages.push(response.message);
                messages.push({
                    role: 'tool',
                    content: output.toString(),
                });
            } else {
                console.log('Function', tool.function.name, 'not found');
            }
        }

        // Get final response from model with function outputs
        const finalResponse = await ollama.chat({
            model: model,
            messages: messages
        });
        console.log('Final response:', finalResponse.message.content);
    } else {
        console.log('No tool calls returned from model');
    }
}
          "tool_calls": [
            {
              "type": "function",
              "function": {
                "index": 0,
                "name": "get_temperature",
                "arguments": {"city": "New York"}
              }
            }
          ]
        },
        {"role": "tool", "tool_name": "get_temperature", "content": "22°C"}
      ],
      "stream": false
    }'
    ```
  </Tab>
  <Tab title="Python">
    Install the Ollama Python SDK:
    ```bash
    # with pip
    pip install ollama -U

    # with uv
    uv add ollama    
    ```
--
    if response.message.tool_calls:
      # only recommended for models which only return a single tool call
      call = response.message.tool_calls[0]
      result = get_temperature(**call.function.arguments)
      # add the tool result to the messages
      messages.append({"role": "tool", "tool_name": call.function.name, "content": str(result)})

      final_response = chat(model="qwen3", messages=messages, tools=[get_temperature], think=True)
      print(final_response.message.content)
    ```
  </Tab>
  <Tab title="JavaScript">
    Install the Ollama JavaScript library:
    ```bash
    # with npm
    npm i ollama

    # with bun
    bun i ollama
    ```

    ```typescript
    import ollama from 'ollama'

    function getTemperature(city: string): string {
      const temperatures: Record<string, string> = {
        'New York': '22°C',
        'London': '15°C',
--
    if (response.message.tool_calls?.length) {
      // only recommended for models which only return a single tool call
      const call = response.message.tool_calls[0]
      const args = call.function.arguments as { city: string }
      const result = getTemperature(args.city)
      // add the tool result to the messages
      messages.push({ role: 'tool', tool_name: call.function.name, content: result })

      // generate the final response
      const finalResponse = await ollama.chat({ model: 'qwen3', messages, tools, think: true })
      console.log(finalResponse.message.content)
    }
    ```
  </Tab>
</Tabs>

## Parallel tool calling

<Tabs>
  <Tab title="cURL">
    Request multiple tool calls in parallel, then send all tool responses back to the model.

    ```shell
    curl -s http://localhost:11434/api/chat -H "Content-Type: application/json" -d '{
      "model": "qwen3",
      "messages": [{"role": "user", "content": "What are the current weather conditions and temperature in New York and London?"}],
      "stream": false,
      "tools": [
--
          "tool_calls": [
            {
              "type": "function",
              "function": {
                "index": 0,
                "name": "get_temperature",
                "arguments": {"city": "New York"}
              }
            },
            {
              "type": "function",
              "function": {
                "index": 1,
                "name": "get_conditions",
                "arguments": {"city": "New York"}
              }
            },
            {
              "type": "function",
              "function": {
                "index": 2,
                "name": "get_temperature",
                "arguments": {"city": "London"}
              }
            },
            {
--
    if response.message.tool_calls:
      # process each tool call 
      for call in response.message.tool_calls:
        # execute the appropriate tool
        if call.function.name == 'get_temperature':
          result = get_temperature(**call.function.arguments)
        elif call.function.name == 'get_conditions':
          result = get_conditions(**call.function.arguments)
        else:
          result = 'Unknown tool'
        # add the tool result to the messages
        messages.append({'role': 'tool',  'tool_name': call.function.name, 'content': str(result)})

      # generate the final response
      final_response = chat(model='qwen3', messages=messages, tools=[get_temperature, get_conditions], think=True)
      print(final_response.message.content)
    ```
  </Tab>
  <Tab title="JavaScript">
    ```typescript
    import ollama from 'ollama'

    function getTemperature(city: string): string {
      const temperatures: { [key: string]: string } = {
        "New York": "22°C",
        "London": "15°C",
        "Tokyo": "18°C"
      }
--
    if (response.message.tool_calls) {
      // process each tool call 
      for (const call of response.message.tool_calls) {
        // execute the appropriate tool
        let result: string
        if (call.function.name === 'get_temperature') {
          const args = call.function.arguments as { city: string }
          result = getTemperature(args.city)
        } else if (call.function.name === 'get_conditions') {
          const args = call.function.arguments as { city: string }
          result = getConditions(args.city)
        } else {
          result = 'Unknown tool'
        }
        // add the tool result to the messages
        messages.push({ role: 'tool', tool_name: call.function.name, content: result })
      }

      // generate the final response
      const finalResponse = await ollama.chat({ model: 'qwen3', messages, tools, think: true })
      console.log(finalResponse.message.content)
    }
    ```
  </Tab>
</Tabs>


## Multi-turn tool calling (Agent loop)
--
An agent loop allows the model to decide when to invoke tools and incorporate their results into its replies. 

It also might help to tell the model that it is in a loop and can make multiple tool calls. 

<Tabs>
  <Tab title="Python">
    ```python
    from ollama import chat, ChatResponse


    def add(a: int, b: int) -> int:
      """Add two numbers"""
      """
      Args:
        a: The first number
        b: The second number

      Returns:
        The sum of the two numbers
      """
      return a + b


    def multiply(a: int, b: int) -> int:
      """Multiply two numbers"""
      """
--
        if response.message.tool_calls:
            for tc in response.message.tool_calls:
                if tc.function.name in available_functions:
                    print(f"Calling {tc.function.name} with arguments {tc.function.arguments}")
                    result = available_functions[tc.function.name](**tc.function.arguments)
                    print(f"Result: {result}")
                    # add the tool result to the messages
                    messages.append({'role': 'tool', 'tool_name': tc.function.name, 'content': str(result)})
        else:
            # end the loop when there are no more tool calls
            break
      # continue the loop with the updated messages
    ```
  </Tab>
  <Tab title="JavaScript">
    ```typescript
    import ollama from 'ollama'

    type ToolName = 'add' | 'multiply'

    function add(a: number, b: number): number {
      return a + b
    }

    function multiply(a: number, b: number): number {
      return a * b
    }
--
      while (true) {
        const response = await ollama.chat({
          model: 'qwen3',
          messages,
          tools,
          think: true,
        })

        messages.push(response.message)
        console.log('Thinking:', response.message.thinking)
        console.log('Content:', response.message.content)

        const toolCalls = response.message.tool_calls ?? []
        if (toolCalls.length) {
          for (const call of toolCalls) {
            const fn = availableFunctions[call.function.name as ToolName]
            if (!fn) {
              continue
            }

            const args = call.function.arguments as { a: number; b: number }
            console.log(`Calling ${call.function.name} with arguments`, args)
            const result = fn(args.a, args.b)
            console.log(`Result: ${result}`)
            messages.push({ role: 'tool', tool_name: call.function.name, content: String(result) })
          }
        } else {
          break
        }
      }
    }

    agentLoop().catch(console.error)
    ```
  </Tab>
</Tabs>


--
When streaming, gather every chunk of `thinking`, `content`, and `tool_calls`, then return those fields together with any tool results in the follow-up request.

<Tabs>
  <Tab title="Python">
```python
from ollama import chat 


def get_temperature(city: str) -> str:
  """Get the current temperature for a city
  
  Args:
    city: The name of the city

  Returns:
    The current temperature for the city
  """
  temperatures = {
    'New York': '22°C',
    'London': '15°C',
  }
  return temperatures.get(city, 'Unknown')


messages = [{'role': 'user', 'content': "What's the temperature in New York?"}]

--
  tool_calls = []

  done_thinking = False
  # accumulate the partial fields
  for chunk in stream:
    if chunk.message.thinking:
      thinking += chunk.message.thinking
      print(chunk.message.thinking, end='', flush=True)
    if chunk.message.content:
      if not done_thinking:
        done_thinking = True
        print('\n')
      content += chunk.message.content
      print(chunk.message.content, end='', flush=True)
    if chunk.message.tool_calls:
      tool_calls.extend(chunk.message.tool_calls)
      print(chunk.message.tool_calls)

  # append accumulated fields to the messages
  if thinking or content or tool_calls:
    messages.append({'role': 'assistant', 'thinking': thinking, 'content': content, 'tool_calls': tool_calls})

  if not tool_calls:
    break

  for call in tool_calls:
    if call.function.name == 'get_temperature':
      result = get_temperature(**call.function.arguments)
    else:
      result = 'Unknown tool'
    messages.append({'role': 'tool', 'tool_name': call.function.name, 'content': result})
```

  </Tab>
  <Tab title="JavaScript">
```typescript
import ollama from 'ollama'

function getTemperature(city: string): string {
  const temperatures: Record<string, string> = {
    'New York': '22°C',
    'London': '15°C',
  }
  return temperatures[city] ?? 'Unknown'
}

const getTemperatureTool = {
  type: 'function',
  function: {
    name: 'get_temperature',
    description: 'Get the current temperature for a city',
--
  while (true) {
    const stream = await ollama.chat({
      model: 'qwen3',
      messages,
      tools: [getTemperatureTool],
      stream: true,
      think: true,
    })

    let thinking = ''
    let content = ''
    const toolCalls: any[] = []
    let doneThinking = false

    for await (const chunk of stream) {
      if (chunk.message.thinking) {
        thinking += chunk.message.thinking
        process.stdout.write(chunk.message.thinking)
      }
      if (chunk.message.content) {
        if (!doneThinking) {
          doneThinking = true
          process.stdout.write('\n')
        }
        content += chunk.message.content
        process.stdout.write(chunk.message.content)
--
      if (chunk.message.tool_calls?.length) {
        toolCalls.push(...chunk.message.tool_calls)
        console.log(chunk.message.tool_calls)
      }
    }

    if (thinking || content || toolCalls.length) {
      messages.push({ role: 'assistant', thinking, content, tool_calls: toolCalls } as any)
    }

    if (!toolCalls.length) {
      break
    }

    for (const call of toolCalls) {
      if (call.function.name === 'get_temperature') {
        const args = call.function.arguments as { city: string }
        const result = getTemperature(args.city)
        messages.push({ role: 'tool', tool_name: call.function.name, content: result } )
      } else {
        messages.push({ role: 'tool', tool_name: call.function.name, content: 'Unknown tool' } )
      }
    }
  }
}

agentLoop().catch(console.error)
    ```
  </Tab>
</Tabs>

This loop streams the assistant response, accumulates partial fields, passes them back together, and appends the tool results so the model can complete its answer.

  console.log('Thinking:\n========\n\n' + response.message.thinking)
  console.log('\nResponse:\n========\n\n' + response.message.content + '\n\n')
}

main()
