#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import chalk from "chalk";
const THINKING_TOOL = {
    name: "thinkingtool",
    description: "A tool for logging thoughts and reasoning steps",
    parameters: {
        type: "object",
        properties: {
            thought: {
                type: "string",
                description: "The thought or reasoning step to log"
            }
        },
        required: ["thought"]
    }
};
class ThinkingToolServer {
    processThought(params) {
        console.error(chalk.blue("💭 Thought:"), params.thought);
        return {
            content: [{
                    type: "text",
                    text: "Thought logged successfully."
                }]
        };
    }
}
const server = new Server({
    name: "thinking-tool-server",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
const thinkingServer = new ThinkingToolServer();
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [THINKING_TOOL],
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "thinkingtool") {
        return thinkingServer.processThought(request.params.arguments);
    }
    return {
        content: [{
                type: "text",
                text: `Unknown tool: ${request.params.name}`
            }],
        isError: true
    };
});
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Thinking Tool MCP Server running on stdio");
}
runServer().catch(error => {
    console.error("Error running server:", error);
    process.exit(1);
});
