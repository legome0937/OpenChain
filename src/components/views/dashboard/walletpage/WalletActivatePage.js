import { useEffect, useState } from "react";
import randomWords from "random-words";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { JSEncrypt } from "jsencrypt";

import { hashCode } from "../../../../service/Utils";
import OcxPasswordChecklist from "../../../common/OcxPasswordChecklist";
import PassphraseImportDialog from "../../../common/PassphraseImportDialog";
import PasscodeConfirmDialog from "../../../common/PasscodeConfirmDialog";
import AccountService from "../../../../service/Account";
import OcxButton from "../../../common/OcxButton";
import OcxSpinButton from "../../../common/OcxSpinButton";

var rsaCrypt = new JSEncrypt();
const accountService = new AccountService();
const eye = <FontAwesomeIcon icon={faEye} />;

const WalletActivatePage = (props) => {
  const { userToken, showToast, onRegisteredAccount } = props;

  const [hide_passcode_checklist, setHidePasscodeCheckBox] = useState(true);
  const [lock_account, setLockAccount] = useState(true);
  const [accounts, setAccounts] = useState(null);
  const [show_passphrase_import_dialog, setShowPassPhraseImportDialog] =
    useState(null);
  const [passcode, setPasscode] = useState("");
  const [show_passcode, setShowPasscode] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [passcode_confirm, setPasscodeConfirm] = useState("");
  const [encrypted_passphrase, setEncryptedPassphrase] = useState("");
  const [error, showError] = useState("");
  const [rsa_crypt_inited, setRsaCryptInited] = useState(false);

  useEffect(() => {
    let encryptKey = localStorage.getItem("encryptKey");
    setEncryptKey(encryptKey);
  });

  const setEncryptKey = (encryptKey) => {
    rsaCrypt.setPublicKey(encryptKey);
    setRsaCryptInited(true);
  };
  const onGeneratePassphrase = (ev) => {
    let randomWordList = randomWords(12).join(" ");
    setPassphrase(randomWordList);
    setEncryptedPassphrase(rsaCrypt.encrypt(randomWordList));
  };
  const onChangePasscode = (ev) => {
    setPasscode(ev.target.value);
    setHidePasscodeCheckBox(false);
  };
  const onChangePasscodeConfirm = (ev) => {
    setPasscodeConfirm(ev.target.value);
    let ret = validatePassword(passcode, ev.target.value);
    if (ret != 0) {
      showError("Passcode not match");
    } else {
      showError("");
    }
  };
  const onLeaveFromPasscodeInput = (event) => {
    setHidePasscodeCheckBox(true);
  };
  const togglePasscodeVisiblity = () => {
    setShowPasscode(!show_passcode);
  };
  const onClickImportPassphrase = (ev) => {
    setShowPassPhraseImportDialog(true);
  };
  const onCancelPassphraseImportDialog = () => {
    setShowPassPhraseImportDialog(false);
  };
  const onOkPassphraseImportDialog = async (param) => {
    let encryptedPassphrase = rsaCrypt.encrypt(param.passphrase);
    setEncryptedPassphrase(encryptedPassphrase);
    console.log("************* onOkPassphraseImportDialog(): param=", param);
    setShowPassPhraseImportDialog(false);
    let resp = await accountService.restoreAccount({
      userToken: userToken,
      password: hashCode(param.password),
      passphrase: encryptedPassphrase,
    });
    if (resp.error === 0) {
      console.log("************* restoreAccount(): response=", resp);
      setLockAccount(false);
      setAccounts(resp.data);
      onRegisteredAccount();
      // self.setState({ user_mode: USER_WITH_ACCOUNT });
      return;
    } else if (resp.error === -1000) {
      showToast(1, "Invalid response for creating account");
      return;
    }
    showToast(1, resp.data);
  };
  const validatePassword = (password, confirmPassword) => {
    var re = {
      lowercase: /(?=.*[a-z])/,
      uppercase: /(?=.*[A-Z])/,
      numeric_char: /(?=.*[0-9])/,
      special_char: /(?=.[!@#$%^&<>?()\-+*=|{}[\]:";'])/,
      atleast_8: /(?=.{8,})/,
    };
    if (!re.lowercase.test(password)) return -1;
    if (!re.uppercase.test(password)) return -2;
    if (!re.numeric_char.test(password)) return -3;
    if (!re.special_char.test(password)) return -4;
    if (!re.atleast_8.test(password)) return -5;
    if (password !== confirmPassword) return -6;
    return 0;
  };
  const onCreateAccont = async (params) => {
    let { stopWait, getExtraData } = params;
    let passwordValidation = validatePassword(passcode, passcode_confirm);
    if (passwordValidation < 0) {
      showToast(1, "Invalid password");
      stopWait();
      return;
    }
    // Perform additional validation for email-phone
    // If required action performed, btnCmpnt.stopTimer() must be called to stop loading
    if (userToken === null) {
      showToast(1, "Error: user token invalid(null)");
      stopWait();
      return;
    }
    if (encrypted_passphrase === "") {
      showToast(1, "Invalid passphrase");
      stopWait();
      return;
    }
    if (!rsa_crypt_inited) {
      showToast(1, "Not inited system modules yet");
      stopWait();
      return;
    }
    console.log(encrypted_passphrase);
    let resp = await accountService.createAccount({
      userToken: userToken,
      password: hashCode(passcode),
      passphrase: encrypted_passphrase,
    });
    stopWait();
    if (resp.error === 0) {
      setLockAccount(false);
      setAccounts(resp.data);
      onRegisteredAccount();
      // self.setState({ user_mode: USER_WITH_ACCOUNT });
      return;
    } else if (resp.error === -1000) {
      showToast(1, "Invalid response for creating account");
      return;
    }
    showToast(1, resp.data);
  };

  return (
    <div className="flex justify-start w-full">
      <div className="flex justify-start w-full mb-10 ml-36">
        <div className="items-start w-1/2">
          <div className="passphrase-container">
            <textarea
              className="passphrase-box resize-none border border-grey-light h-40 bg-gray-100 p-3 mb-5 font-16 main-font focus:outline-none rounded w-full"
              name="passphrase"
              // onChange={this.handleInputChange}
              value={passphrase}
              placeholder="Passphrase"
              autoComplete="off"
              disabled={true}
            />
            <div className="flex justify-end w-full">
              <OcxButton label="Generate" onClick={onGeneratePassphrase} />
            </div>
          </div>
          <hr className="mt-10 mb-10" />
          <div className="account-passcode-container block w-full mb-5">
            <input
              type={show_passcode ? "text" : "password"}
              className="passcode-input border border-grey-light bg-gray-100 w-full p-3 font-16 main-font focus:outline-none rounded "
              name="passcode"
              // value={passcode}
              onChange={onChangePasscode}
              onBlur={onLeaveFromPasscodeInput}
              placeholder="Passcode"
              autoComplete="off"
            />
            <i
              className="ShowPasswordIcon font-16"
              onClick={togglePasscodeVisiblity}
            >
              {eye}
            </i>
          </div>
          <OcxPasswordChecklist
            password={passcode || ""}
            confirmPassword={passcode_confirm || ""}
            hidden={hide_passcode_checklist}
          />
          <div className="mb-10 w-full">
            <input
              type="password"
              className="block border border-grey-light bg-gray-100 w-full p-3 font-16 main-font focus:outline-none rounded "
              name="confirm_passcode"
              // value={passcode_confirm}
              onChange={onChangePasscodeConfirm}
              placeholder="Confirm Passcode"
              autoComplete="off"
            />
            <div className="error-box main-font font-14 text-red-500">
              {error}
            </div>
          </div>
          <div
            id="create-account-button-container"
            className="flex justify-end w-full"
          >
            {/* Send Button */}
            <OcxSpinButton
              title="New Account"
              onClick={onCreateAccont}
              extraData={null}
            />
          </div>
          <div className="import-passphrase-container flex justify-end mt-5 mb-5">
            <span
              className="main-font font-16 link-button"
              onClick={onClickImportPassphrase}
            >
              Import passphrase
            </span>
          </div>
        </div>
      </div>
      <div></div>
      <PassphraseImportDialog
        className="passphrase-import-dialog"
        show={show_passphrase_import_dialog}
        onOk={onOkPassphraseImportDialog}
        onCancel={onCancelPassphraseImportDialog}
      />
    </div>
  );
};

export default WalletActivatePage;
