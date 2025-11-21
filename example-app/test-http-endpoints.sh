#!/bin/bash

# Test script for HTTP endpoints

echo "Testing HTTP endpoints..."
echo ""

# Test 1: Stripe Webhook
echo "1. Testing POST /webhooks/stripe"
curl -X POST http://localhost:4001/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type": "payment_intent.succeeded", "data": {"id": "pi_123"}}' \
  -s | jq .
echo ""

# Test 2: Generic Webhook
echo "2. Testing POST /webhooks/generic"
curl -X POST http://localhost:4001/webhooks/generic \
  -H "Content-Type: application/json" \
  -d '{"event": "user.created", "userId": "12345"}' \
  -s | jq .
echo ""

# Test 3: GitHub OAuth Callback
echo "3. Testing GET /auth/callback/github?code=abc123&state=xyz"
curl -X GET "http://localhost:4001/auth/callback/github?code=abc123&state=xyz" \
  -s | jq .
echo ""

# Test 4: Dynamic OAuth Callback (Google)
echo "4. Testing GET /auth/callback/google?code=def456&state=qrs"
curl -X GET "http://localhost:4001/auth/callback/google?code=def456&state=qrs" \
  -s | jq .
echo ""

# Test 5: Logout
echo "5. Testing POST /auth/logout"
curl -X POST http://localhost:4001/auth/logout \
  -H "Content-Type: application/json" \
  -s | jq .
echo ""

echo "Tests complete!"
