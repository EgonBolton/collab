/* eslint-disable @typescript-eslint/no-unused-vars */
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { WebsocketProvider } from "y-websocket";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import * as Y from "yjs";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { type EditorState } from "lexical";
import { type Provider } from "@lexical/yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { HocuspocusProvider, HocuspocusProviderWebsocket, TiptapCollabProvider } from "@hocuspocus/provider";

const socket = new HocuspocusProviderWebsocket({
  url: 'ws://localhost:1234',
})

export default function Editor({
  initialEditorState,
  noteId,
}: {
  initialEditorState: string | null;
  noteId: string;
}) {
  const saveEditorState = (editorState: EditorState) => {
    console.log("saving editor state", noteId);
    localStorage.setItem(noteId, JSON.stringify(editorState));
  };

  return (
    <LexicalComposer
      key={noteId}
      initialConfig={{
        editorState: null,
        namespace: "test",
        onError: (error: Error) => console.log(error),
      }}
    >
      <PlainTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={<div>Enter some text...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <CollaborationPlugin
        id={noteId}
        providerFactory={createWebsocketProvider}
        initialEditorState={initialEditorState}
        shouldBootstrap={true}
      />
      <OnChangePlugin onChange={saveEditorState} ignoreSelectionChange />
    </LexicalComposer>
  );
}

function createWebsocketProvider(
  id: string,
  yjsDocMap: Map<string, Y.Doc>
): Provider {
  const doc = new Y.Doc();
  yjsDocMap.set(id, doc);

  // const idbProvider = new IndexeddbPersistence(id, doc);
  // idbProvider.once("synced", () => {
  //   console.log("idb");
  // });

  // const wsProvider = new WebsocketProvider("ws://localhost:1234", id, doc, {
  //   connect: false,
  // });

  const hocuspocusProvider = new TiptapCollabProvider({
    websocketProvider: socket,
    appId: 'vykoj4m5',
    name: id,
    token: "test",
    document: doc,
  });

  // wsProvider.on("sync", () => console.log("ws"));
  hocuspocusProvider.on("sync", () => console.log("hocuspocus"));

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return hocuspocusProvider;
}
