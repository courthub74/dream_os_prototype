origin-os-api/
  src/
    app.ts
    server.ts

    config/
      env.ts
      db.ts
      cors.ts

    modules/
      auth/
        auth.routes.ts
        auth.controller.ts
        auth.service.ts
        auth.middleware.ts

      users/
        users.model.ts
        users.service.ts
        users.routes.ts

      artworks/
        artworks.model.ts
        artworks.routes.ts
        artworks.controller.ts
        artworks.service.ts

      storage/
        storage.service.ts   // S3/R2 upload, signed URLs, thumbnails

      ai/
        ai.routes.ts
        ai.controller.ts
        ai.service.ts        // provider wrapper
        ai.providers/
          openai.provider.ts
          stability.provider.ts

      socials/
        socials.routes.ts
        socials.controller.ts
        socials.service.ts   // OAuth + posting
        socials.providers/
          x.provider.ts
          instagram.provider.ts

      web3/
        web3.routes.ts
        web3.controller.ts
        web3.service.ts      // wallet verify + mint/list flows
        web3.chains/
          xrpl.chain.ts
          evm.chain.ts

      jobs/
        queue.ts
        workers/
          ai.worker.ts
          post.worker.ts
          mint.worker.ts

    shared/
      crypto.ts              // encryption helpers for tokens
      errors.ts
      validate.ts            // zod/joi schemas
      rateLimit.ts
      logger.ts
