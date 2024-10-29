import { Form, ActionPanel, Action, showHUD, popToRoot } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";
import { useEffect, useState } from "react";

type Values = {
  title: string;
  url: string;
  list: "Read Later" | "Watch Later" | "Listen Later";
  note: string;
};

const DELIMITER = "*****";

export default function Command() {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [list, setList] = useState("Read Later");
  const [note, setNote] = useState("");

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

    setTitle(title);
    setNote(url);
    setLoading(false);
  }

  useEffect(() => {
    getTabInfo();
  }, []);

  async function handleSubmit(values: Values) {
    setLoading(true);

    const { list, title, note } = values;

    await runAppleScript(
      `
tell application "Reminders"
  if not (exists list "${list}") then
  	make new list with properties {name:"${list}"}
  end if

	set mylist to list "${list}"

	tell mylist
		make new reminder with properties {name:"${title}", body:"${note}"}
	end tell
end tell
`,
    );

    setLoading(false);
    await showHUD(`New item saved to ${list}`);
    await popToRoot({ clearSearchBar: true });
  }

  return (
    <Form
      isLoading={loading}
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="title" title="Title" placeholder="Title" value={title} onChange={(e) => setTitle(e)} />
      <Form.Dropdown id="list" title="Dropdown" autoFocus value={list} onChange={(e) => setList(e)}>
        <Form.Dropdown.Item value="Read Later" title="Read Later" />
        <Form.Dropdown.Item value="Watch Later" title="Watch Later" />
        <Form.Dropdown.Item value="Listen Later" title="Listen Later" />
      </Form.Dropdown>
      <Form.TextArea id="note" title="Notes" value={note} onChange={(e) => setNote(e)} />
    </Form>
  );
}
