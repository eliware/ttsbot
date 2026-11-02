import { expect, jest, test } from "@jest/globals";
import { createOpenAIClient } from "../../src/audio/client.mjs";

test("creates and caches the OpenAI client on first use", () => {
  const client = {};
  const createClient = jest.fn(() => client);
  const getClient = createOpenAIClient({ createClient, getApiKey: () => "key" });
  expect(getClient()).toBe(client);
  expect(getClient()).toBe(client);
  expect(createClient).toHaveBeenCalledTimes(1);
  expect(createClient).toHaveBeenCalledWith({ apiKey: "key" });
});

test("uses the default API key provider", () => {
  const createClient = jest.fn(() => ({}));
  const getClient = createOpenAIClient({ createClient });
  expect(getClient()).toEqual({});
  expect(createClient).toHaveBeenCalledWith({ apiKey: process.env.OPENAI_API_KEY });
});

test("accepts omitted client options", () => {
  expect(typeof createOpenAIClient()).toBe("function");
});
