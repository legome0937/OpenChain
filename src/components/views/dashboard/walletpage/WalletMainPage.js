import { useEffect, useState } from "react";
import { radio } from "@material-tailwind/react";

import { hashCode } from "../../../../service/Utils";
import OcxSpinButton from "../../../common/OcxSpinButton";
import AccountService from "../../../../service/Account";
import PageTabBar from "../../../common/PageTabBar";
import OcxCard from "../../../common/OcxCard";
import DropdownList from "../../../common/DropdownList";
import OcxButton from "../../../common/OcxButton";
import OcxRadioButton from "../../../common/OcxRadioButton";
import RegularModal from "../../../common/RegularModal";
import QRCode from "react-qr-code";
import ExchangeSwap from "../../../common/exchange/ExchangeSwap";
import SwapPage from "./SwapPage";
import Transaction from "./transaction/index.js";

const accountService = new AccountService();

const IDLE = 0,
  LOCKING = 1,
  SENDING = 2;

const USERS = [
  {
    iconUrl: "",
    title: "PNFT",
  },
  {
    iconUrl: "",
    title: "OCAT",
  },
];
const ADDRESS = [
  {
    iconUrl: "",
    title: "ETH Address",
  },
  {
    iconUrl: "",
    title: "BTC Address",
  },
  {
    iconUrl: "",
    title: "Other",
  },
];

const walletPageTabItems = [
  {
    name: "transfer-tab",
    title: "Transfer",
  },
  {
    name: "swap-tab",
    title: "Swap",
  },
];

const WalletMainPage = (props) => {
  const { userToken, onLockedAccount, showToast } = props;

  const [locked, setLocked] = useState(false);
  const [accounts, setAccounts] = useState({});
  const [balance, setBalance] = useState({});
  const [price, setPrice] = useState({});
  const [current_tab, setCurrentTab] = useState(0);
  const [to_address, setDestAddress] = useState("");
  const [transfer_amount, setTransferAmount] = useState(0);
  const [show_passcode_confirm, setShowPasscodeConfirm] = useState(false);
  const [temp_storage, setTempStorage] = useState(null);
  const [current_state, setCurrentState] = useState(IDLE);
  const [user_password_to_confirm_tx, setUserPasswordToConfirmTx] =
    useState(null);
  const [balance_timer, setBalanceTimer] = useState(null);

  const [deposit, setDeposit] = useState(false);

  const onLockAccont = async (params) => {
    // if (this.state.current_state !== IDLE) {
    //     stopWait();
    //     showToast(1, 'Could not perform the current action during another one');
    //     return;
    // }
    // Try to unlock
    let { stopWait, getExtraData } = params;
    setCurrentState(LOCKING);
    let resp = await accountService.lockAccount({
      userToken: userToken,
    });
    setCurrentState(IDLE);
    stopWait();
    if (balance_timer) {
      clearInterval(balance_timer);
      balance_timer = null;
    }
    if (resp.error === 0) {
      // Display unlocked account page
      setLocked(true);
      onLockedAccount();
      return;
    } else if (resp.error === -1000) {
      showToast(1, "Invalid response for locking account");
      return;
    }
    showToast(1, resp.data);
  };
  const onChangeDestAddress = (ev) => {
    setDestAddress(ev.target.value);
  };
  const onChangeTransferAmount = (ev) => {
    setTransferAmount(ev.target.value);
  };
  const onSelectTab = (tabName) => {
    setCurrentTab(tabName);
  };
  const onTransfer = (params) => {
    openPasscodeConfirmDialog(params);
  };
  const openPasscodeConfirmDialog = (params) => {
    setTempStorage({
      stopWait: params.stopWait,
      getExtraData: params.getExtraData,
    });
    setShowPasscodeConfirm(true);
  };
  const onOkPasscodeConfirmDialog = (userPasswordToConfirmTx) => {
    setShowPasscodeConfirm(false);
    setUserPasswordToConfirmTx(userPasswordToConfirmTx);
    let { stopWait, getExtraData } = temp_storage;
    setTempStorage(null);
    _transfer(stopWait, getExtraData);
  };
  const onCancelPasscodeConfirmDialog = () => {
    let { stopWait, getExtraData } = temp_storage;
    setTempStorage(null);
    stopWait();
  };

  const onClickDeposit = () => {
    setDeposit(true);
    console.log("Deposit");
  };
  const setTransferAmountUI = (_amount) => {};
  const _transfer = async (stopWait, getExtraData) => {
    // if (this.state.current_state !== IDLE) {
    //     stopWait();
    //     showToast(1, 'Could not perform the current action during another one');
    //     return;
    // }
    let toAddress = to_address ? to_address : null;
    if (toAddress === null) {
      stopWait();
      showToast(1, "Please input receiving address");
      return;
    }
    if (toAddress.trim().length !== 42) {
      stopWait();
      showToast(1, "Please input valid receiving address");
      return;
    }

    let amount = transfer_amount ? transfer_amount : null;
    if (amount === null || amount.trim() === "") {
      stopWait();
      showToast(1, "Please input the amount to send");
      return;
    }

    setCurrentState(SENDING);

    let resp = await accountService.sendCryptoCurrency({
      userToken: userToken,
      toAddress: toAddress,
      amount: amount,
      password: hashCode(user_password_to_confirm_tx),
    });
    setCurrentState(IDLE);
    stopWait();
    if (resp.error === 0) {
      setTransferAmountUI(0);
      showToast(0, "Sending Complete");
      return;
    } else if (resp.error === -1000) {
      showToast(1, "Invalid response for sending token");
    } else {
      showToast(1, resp.data);
    }
  };

  useEffect(() => {
    (async () => {
      let resp = {};
      // fetch balances
      resp = await accountService.getBalances({ userToken });
      if (resp.error) showToast(1, resp.data);
      else setBalance(resp.data);
      // fetch prices
      resp = await accountService.getPrices({ userToken });
      if (resp.error) showToast(1, resp.data);
      else setPrice(resp.data);
    })();
  }, []);

  return (
    <>
      {deposit ? (
        <RegularModal title="Success">
          <Transaction></Transaction>
        </RegularModal>
      ) : (
        <></>
      )}
      <div className="flex flex-row">
        <div className="flex flex-col gap-10 basis-1/3">
          <OcxCard title="Transaction History">
            <div className="mb-5"></div>
            <hr />
            <div className="flex justify-center mt-5"></div>
          </OcxCard>

          <OcxCard title="Assets Distributions">
            <div className="mb-5"></div>
            <hr />
          </OcxCard>
        </div>

        <div className="flex flex-col gap-10  ml-10 basis-1/8 max-w-lg">
          <>
            <OcxCard title="Contacts">
              <div className="flex flex-row">
                <div className="flex flex-col grow-1">
                  <OcxRadioButton id="1" label="first"></OcxRadioButton>
                  <OcxRadioButton id="2" label="second"></OcxRadioButton>
                  <OcxRadioButton id="3" label="third"></OcxRadioButton>
                </div>
                <div className="grow-0">
                  <DropdownList
                    placeholder="Setting"
                    items={USERS}
                  ></DropdownList>
                </div>
              </div>
            </OcxCard>

            <OcxCard title="Transactions">
              <div className="grid grid-cols-3 gap-5 items-center">
                <OcxButton
                  label="&nbsp;Deposit&nbsp;&nbsp;"
                  onClick={onClickDeposit}
                ></OcxButton>
                <OcxButton label="Withdraw"></OcxButton>
                <OcxButton label="&nbsp;Transfer&nbsp;"></OcxButton>
                <OcxButton label="&nbsp;&nbsp;&nbsp;Swap&nbsp;&nbsp;&nbsp;"></OcxButton>
                <OcxButton label="Request For Payment"></OcxButton>
              </div>
            </OcxCard>

            <OcxCard title="My Address">
              <div className="flex justify-center flex-col gap-5">
                <DropdownList
                  placeholder="ETH Address"
                  items={ADDRESS}
                ></DropdownList>

                <QRCode value="ss" size={125} />

                <OcxButton label="Copy"></OcxButton>
              </div>
            </OcxCard>
          </>
        </div>
      </div>
    </>
  );
};

export default WalletMainPage;
