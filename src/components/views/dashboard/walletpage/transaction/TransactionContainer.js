import { useEffect, useState } from "react";
import ExchangeSwap from "../../../../common/exchange/ExchangeSwap";
import SwapPage from "../SwapPage";

const TransactionContainer = (props) => {
  const { target } = props;

  const [currentComponent, setCurrentComponent] = useState(null);

  useEffect(() => {
    switch (target) {
      case "transaction-history":
        break;
      case "swap":
        setCurrentComponent(<ExchangeSwap></ExchangeSwap>);
        break;
      case "transfer":
        setCurrentComponent(<SwapPage></SwapPage>);
        break;
      case "buy-sell":
        break;

      default:
        break;
    }
  }, [target]);

  return <>{currentComponent}</>;
};
export default TransactionContainer;
