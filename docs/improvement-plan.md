# Improvement Plan

This document tracks planned production hardening and maintainability improvements for the canteen reservation system.

## Priority items

1. Restrict public authentication endpoints.
2. Move secrets to environment variables.
3. Disable H2 console in production profile.
4. Avoid returning raw exception messages to clients.
5. Add service-level tests for reservation business rules.
