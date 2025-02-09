import { addItem, MenuItem } from "@moonlight-mod/wp/contextMenu_contextMenu";
import { closeContextMenu } from "@moonlight-mod/wp/discord/actions/ContextMenuActionCreators";
import { openModal } from "@moonlight-mod/wp/discord/components/common/index";
import React from "@moonlight-mod/wp/react";
import { TranslateTextModal } from "@moonlight-mod/wp/translateText_modal";

function TranslateItem() {
  return (
    <MenuItem
      id="translate"
      label="Translate"
      // @ts-expect-error event parameter not defined in type
      action={(event: any) => {
        const text = event?.view?.getSelection()?.toString() ?? window.getSelection()?.toString();
        openModal((props) => <TranslateTextModal {...props} text={text} />);
        closeContextMenu();
      }}
    />
  );
}

addItem("message", TranslateItem, "copy"); // message context menu
addItem("textarea-context", TranslateItem, "copy"); // textarea context menu
addItem("text-context", TranslateItem, "copy"); // text context menu
