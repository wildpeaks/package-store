import {IStore} from "../../../..";
import {Props as ViewpointsProps} from "../stores/ViewpointsStore";

export const actionId = "FORWARD VIEWPOINT";
export type Message = Readonly<{
	action: "FORWARD VIEWPOINT";
	viewpoints: ViewpointsProps;
}>;

export type PartialState = {
	viewpoints: ViewpointsProps;
};

export function action<State extends PartialState>(message: Message, store: IStore<State, never>): void {
	const newState = Object.assign({}, store.state, {viewpoints: message.viewpoints});
	Object.freeze(newState);
	store.state = newState;
}
