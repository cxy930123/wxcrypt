export default class Builder {
    private names;
    private values;
    private value;
    constructor(xml?: string);
    start(name: string): void;
    text(content: string): void;
    end(name: string): void;
    build(): any;
}
