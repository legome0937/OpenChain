import { useState } from "react";

import PageTabBar from "../../../../common/PageTabBar";
import TransactionContainer from "./TransactionContainer";

const tabPanels = [
  {
    name: "transaction-history",
    title: "History",
  },
  {
    name: "swap",
    title: "Swap",
  },
  {
    name: "transfer",
    title: "Transfer",
  },
  {
    name: "buy-sell",
    title: "Buy/Sell",
  },
];

const Transaction = (props) => {
  const [currentTab, setCurrentTab] = useState("swap");

  const onSelectTab = (tabName) => {
    setCurrentTab(tabName);
  };

  return (
    <div className="main-container">
      <PageTabBar
        key="transfer-tab"
        onClickItem={onSelectTab}
        items={tabPanels}
        defaultActiveItem="swap"
      ></PageTabBar>

      <TransactionContainer target={currentTab}></TransactionContainer>
    </div>
  );
};

export default Transaction;
