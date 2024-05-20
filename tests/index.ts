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

describe("TBD", () => {
  it("TBD", () => {
    expect(true).to.be.true;
  });
});
