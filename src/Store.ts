interface IMessage {
	action: string;
}

export interface IStore<TState, TMessage extends IMessage> {
	state: Readonly<TState>;
	schedule(message: Readonly<TMessage>): void;
}

export type TAction<TState, TReceives extends IMessage, TEmits extends IMessage> = (
	message: Readonly<TReceives>,
	dispatcher: IStore<TState, TEmits>
) => void;


export class Store<TState, TProps, TMessage extends IMessage> implements IStore<TState, TMessage> {

	/**
	 * Converts state to props.
	 */
	public serialize?: (state: TState) => TProps;

	/**
	 * Immutable application state.
	 */
	private _state: Readonly<TState>;
	public get state(): Readonly<TState> {
		return this._state;
	}
	public set state(newState: Readonly<TState>) {
		if (typeof this.serialize !== 'function'){
			throw new Error('Missing serializer');
		}
		const props = this.serialize(newState);
		this._state = newState;
		this.props = props;
	}

	/**
	 * Callback for listening to props change.
	 */
	public onprops?: (props: Readonly<TProps>) => void;

	/**
	 * Frozen JSON-compatible props for rendering.
	 */
	private _props: Readonly<TProps>;
	public get props(): Readonly<TProps> {
		return this._props;
	}
	public set props(newProps: Readonly<TProps>) {
		const hasChanged = JSON.stringify(newProps) !== JSON.stringify(this.props); // @quickhack Not the cleanest "deep strict equal"
		if (hasChanged){
			this._props = newProps;
			if (this.onprops){
				this.onprops(newProps);
			}
		}
	}


	private actions: {
		[actionId: string]: TAction<TState, any, any>;
	} = {};
	public register(id: string, action: TAction<TState, IMessage, IMessage | never>): void {
		this.actions[id] = action;
	}
	public unregister(id: string): void {
		delete this.actions[id];
	}


	/**
	 * Forwards a message to the Worker messages queue.
	 */
	public schedule(message: Readonly<TMessage>): void {
		this.onmessage({data: message});
	}

	/**
	 * Receives messages from the main thread or from within the Worker.
	 */
	public onmessage(event: {data: Readonly<TMessage> | null | undefined}): void {
		const {data} = event;
		if (data && (data !== null)){
			const actionId = data.action;
			if (actionId in this.actions){
				const action = this.actions[actionId];
				action(data, this);
			} else {
				throw new Error('Unknown action');
			}
		} else {
			throw new Error('Message is not an action');
		}
	}
}


/* eslint-disable class-methods-use-this */
export class StoreWorker<TProps, TMessage extends IMessage> {

	/**
	 * Webworker that can receive actions and emits props.
	 */
	private worker: Worker;
	constructor(worker: Worker) {
		this.worker = worker;
		worker.onmessage = this.onmessage.bind(this);
	}

	/**
	 * Callback for listening to props change.
	 */
	public onprops?: (props: Readonly<TProps>) => void;

	/**
	 * Forwards a message to the Worker messages queue.
	 */
	public schedule(message: Readonly<TMessage>): void {
		this.worker.postMessage(message);
	}

	/**
	 * Receives messages from the webworker.
	 * @param response
	 */
	private onmessage(response: {data: TProps}): void {
		if (this.onprops){
			this.onprops(response.data);
		}
	}
}
