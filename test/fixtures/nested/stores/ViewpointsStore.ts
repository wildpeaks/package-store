import {Store} from "../../../..";
import {Viewpoint, ViewpointJson} from "../classes/Viewpoint";
import {action as setAction, actionId as setActionId, Message as SetMessage} from "../actions/setViewpoint";


export type State = {
	[id: string]: Viewpoint;
};

export type Props = {
	[id: string]: ViewpointJson;
};

function serialize(state: State): Props {
	const props: Props = {};
	for (const id in state) {
		props[id] = state[id].toJson();
	}
	return props;
}

export class ViewpointsStore extends Store<State, Props, SetMessage> {
	public constructor() {
		super();
		this.register(setActionId, setAction);
		this.serialize = serialize;
	}
	public initialize(): void {
		this.state = {
			initial1: new Viewpoint("1 0 0"),
			initial2: new Viewpoint("2 0 0"),
			initial3: new Viewpoint("3 0 0")
		};
	}
}
