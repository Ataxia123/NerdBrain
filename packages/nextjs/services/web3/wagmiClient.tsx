import { createClient } from "wagmi";
import { appChains, wagmiConnectors } from "~~/services/web3/wagmiConnectors";

export const wagmiClient = createClient({
  autoConnect: true,
  connectors: wagmiConnectors,
  provider: appChains.provider,
});
