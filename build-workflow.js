#!/usr/bin/env node
// Run with: node build-workflow.js
// Outputs workflow.json — import this file into n8n directly.

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'nodes');
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');

const signalDetectionCode      = read('signal-detection.js');
const prepareClaudeRequestCode = read('prepare-claude-request.js');
const extractClassificationCode = read('extract-classification.js');
const contentRouterCode        = read('content-router.js');
const smsBuilderCode           = read('sms-builder.js');

const workflow = {
  name: "Trend Analyzer",
  nodes: [
    {
      id: "node-1",
      name: "When clicking 'Execute workflow'",
      type: "n8n-nodes-base.manualTrigger",
      typeVersion: 1,
      position: [240, 300],
      parameters: {}
    },
    {
      id: "node-2",
      name: "Apify Live Feed",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4,
      position: [460, 300],
      parameters: {
        method: "GET",
        url: "https://api.apify.com/v2/acts/apify~instagram-scraper/runs/last/dataset/items?token=YOUR_APIFY_TOKEN&status=SUCCEEDED",
        options: {}
      }
    },
    {
      id: "node-3",
      name: "Signal Detection",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [680, 300],
      parameters: {
        mode: "runOnceForAllItems",
        jsCode: signalDetectionCode
      }
    },
    {
      id: "node-4",
      name: "Signal Filter",
      type: "n8n-nodes-base.filter",
      typeVersion: 2,
      position: [900, 300],
      parameters: {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: "",
            typeValidation: "strict"
          },
          conditions: [
            {
              id: "cond-pass",
              leftValue: "={{ $json.pass }}",
              rightValue: true,
              operator: {
                type: "boolean",
                operation: "equals"
              }
            }
          ],
          combinator: "and"
        }
      }
    },
    {
      id: "node-5",
      name: "Prepare Claude Request",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [1120, 300],
      parameters: {
        mode: "runOnceForAllItems",
        jsCode: prepareClaudeRequestCode
      }
    },
    {
      id: "node-6",
      name: "Claude API",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4,
      position: [1340, 300],
      parameters: {
        method: "POST",
        url: "https://api.anthropic.com/v1/messages",
        authentication: "genericCredentialType",
        genericAuthType: "httpHeaderAuth",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: "anthropic-version", value: "2023-06-01" },
            { name: "content-type",      value: "application/json" }
          ]
        },
        sendBody: true,
        contentType: "raw",
        rawContentType: "application/json",
        body: "={{ '{\"model\":\"claude-haiku-4-5-20251001\",\"max_tokens\":20,\"messages\":[{\"role\":\"user\",\"content\":' + JSON.stringify($json.claude_prompt) + '}]}' }}",
        options: {}
      },
      credentials: {
        httpHeaderAuth: {
          id: "ASSIGN_AFTER_IMPORT",
          name: "Anthropic API Key"
        }
      }
    },
    {
      id: "node-7",
      name: "Extract Classification",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [1560, 300],
      parameters: {
        mode: "runOnceForAllItems",
        jsCode: extractClassificationCode
      }
    },
    {
      id: "node-8",
      name: "Content Router",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [1780, 300],
      parameters: {
        mode: "runOnceForAllItems",
        jsCode: contentRouterCode
      }
    },
    {
      id: "node-9",
      name: "SMS Builder",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [2000, 300],
      parameters: {
        mode: "runOnceForAllItems",
        jsCode: smsBuilderCode
      }
    },
    {
      id: "node-10",
      name: "Send Alert",
      type: "n8n-nodes-base.twilio",
      typeVersion: 1,
      position: [2220, 300],
      parameters: {
        from:    "YOUR_TWILIO_FROM_NUMBER",
        to:      "YOUR_TWILIO_TO_NUMBER",
        message: "={{ $json.message_text }}"
      },
      credentials: {
        twilioApi: {
          id: "ASSIGN_AFTER_IMPORT",
          name: "Twilio account"
        }
      }
    }
  ],
  connections: {
    "When clicking 'Execute workflow'": {
      main: [[{ node: "Apify Live Feed",          type: "main", index: 0 }]]
    },
    "Apify Live Feed": {
      main: [[{ node: "Signal Detection",         type: "main", index: 0 }]]
    },
    "Signal Detection": {
      main: [[{ node: "Signal Filter",            type: "main", index: 0 }]]
    },
    "Signal Filter": {
      main: [[{ node: "Prepare Claude Request",   type: "main", index: 0 }]]
    },
    "Prepare Claude Request": {
      main: [[{ node: "Claude API",               type: "main", index: 0 }]]
    },
    "Claude API": {
      main: [[{ node: "Extract Classification",   type: "main", index: 0 }]]
    },
    "Extract Classification": {
      main: [[{ node: "Content Router",           type: "main", index: 0 }]]
    },
    "Content Router": {
      main: [[{ node: "SMS Builder",              type: "main", index: 0 }]]
    },
    "SMS Builder": {
      main: [[{ node: "Send Alert",               type: "main", index: 0 }]]
    }
  },
  active: false,
  settings: {
    executionOrder: "v1"
  }
};

fs.writeFileSync(
  path.join(__dirname, 'workflow.json'),
  JSON.stringify(workflow, null, 2)
);
console.log('workflow.json created successfully.');
