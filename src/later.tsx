import { Form, ActionPanel, Action, showToast, LaunchType } from "@raycast/api";
import { createDeeplink, DeeplinkType, runAppleScript } from "@raycast/utils";
import { useEffect, useState } from "react";

type Values = {
  textfield: string;
  textarea: string;
  datepicker: Date;
  checkbox: boolean;
  dropdown: string;
  tokeneditor: string[];
};

const DELIMITER = "*****";

export default function Command() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [selection, setSelection] = useState("");
  const [loading, setLoading] = useState(true);

  async function getTabInfo() {
    const data = await runAppleScript(
      `
tell application "Safari"
    set currentTab to current tab of front window
    set tabTitle to name of currentTab
    set tabUrl to URL of currentTab
end tell


return tabTitle & "${DELIMITER}" & tabUrl`,
    );
    const [title, url] = data.split(DELIMITER);
    console.log({ title });
    console.log({ url });
    setTitle(title);
    setUrl(url);
    setLoading(false);
  }
  // await showHUD(res);

  useEffect(() => {
    getTabInfo();
  }, []);

  async function handleSubmit(values: Values) {
    console.log("submit");
    await runAppleScript(
      `
    tell application "Reminders"
        set newList to (make new list with properties {name:"To Listen"})
        set newReminder to (make new reminder with properties {name:"My Reminder", body:"This is a new reminder", URL:"https://www.example.com"})
        set tagList to {"later", "Tag2"}
        set tags of newReminder to tagList
        set list of newReminder to newList
    end tell
    `,
    );
    await showToast({ title: "Submitted form", message: "See logs for submitted values" });
  }

  return (
    <Form
      isLoading={loading}
      actions={
        <ActionPanel>
          <Action.CreateQuicklink
            quicklink={{
              type: DeeplinkType.Extension,
              command: "reminders",
              launchType: LaunchType.Background,
              arguments: {
                name: "test",
              },
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="title" title="Title" placeholder="Title" value={title} />
      <Form.TextField id="url" title="URL" placeholder="URL" value={url} />
      <Form.Dropdown id="dropdown" title="Dropdown" autoFocus value="read-later">
        <Form.Dropdown.Item value="read-later" title="Read later ☕" />
        <Form.Dropdown.Item value="watch-later" title="Watch later 📺" />
        <Form.Dropdown.Item value="listen-later" title="Listen later 🎶" />
      </Form.Dropdown>
      <Form.TextArea id="notes" title="Notes" />
    </Form>
  );
}
