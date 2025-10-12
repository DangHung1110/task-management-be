import { object } from "zod";

export function autoBindUtil<T extends object>(instance: T): void{
    const prototype = Object.getPrototypeOf(instance);

    Object.getOwnPropertyNames(prototype).forEach((name) => {
        const prototype = ( instance as Record<string, unknown> )[name];
        if (name !== "constructor" && typeof prototype === "function") {
            ( instance as Record<string, unknown> )[name] = prototype.bind(instance);
        }
    });
}