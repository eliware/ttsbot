import { describe, expect, jest, test } from "@jest/globals";
import { createPlaybackDependencies } from "../../src/audio/playback-factory.mjs";

describe("playback dependency factory", () => {
  test("creates a pipeline builder and a lazy OpenAI client getter", () => {
    const client = {};
    const createClient = jest.fn(() => client);
    const dependencies = createPlaybackDependencies({
      createClient,
      createBuffer: () => ({}),
      createResource: () => ({}),
      streamType: { Raw: "raw" },
      ResamplerClass: class {},
      log: { error: jest.fn() },
    });

    expect(createClient).not.toHaveBeenCalled();
    expect(dependencies.getOpenAIClient()).toBe(client);
    expect(dependencies.getOpenAIClient()).toBe(client);
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(typeof dependencies.buildPipeline).toBe("function");
  });
});
