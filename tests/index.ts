import {
  logs,
  contract,
  reset,
  stateCache,
  contractEnv,
  setContractImport,
} from "@vsc.eco/contract-testing-utils";

// import { beforeEach, describe, it } from "mocha";
import { expect } from "chai";

const contractImport = import("../build/debug");

beforeAll(() => setContractImport(contractImport));

beforeEach(reset);

describe("Test suite for basic functions of the sdk library", () => {
  it("hash256 function should double hash the given string", () => {
    // arrange
    // double sha256 hash of "abcde"
    const resultString = "1d72b6eb7ba8b9709c790b33b40d8c46211958e13cf85dbcda0ed201a99f2fb9";

    // act
    const result = contract.hash256(Buffer.from("abcde"));
    const hexString = Array.from(result)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');

    // assert
    expect(hexString).to.equal(resultString);
  });
});
