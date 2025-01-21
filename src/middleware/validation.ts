import { Context, Next } from "koa";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

export function validateBody(type: any) {
  return async (ctx: Context, next: Next) => {
    const body = plainToClass(type, ctx.request.body);
    const errors = await validate(body as any);

    if (errors.length > 0) {
      ctx.status = 400;
      ctx.body = {
        error: "Validation failed",
        details: errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
        })),
      };
      return;
    }

    ctx.request.body = body;
    await next();
  };
}
