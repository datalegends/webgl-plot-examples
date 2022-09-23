export namespace Pair {
    function read(pbf: any, end: any): any;
    function _readField(tag: any, obj: any, pbf: any): void;
    function write(obj: any, pbf: any): void;
    namespace Order {
        function read(pbf: any, end: any): any;
        function _readField(tag: any, obj: any, pbf: any): void;
        function write(obj: any, pbf: any): void;
    }
    namespace Indicator {
        function read(pbf: any, end: any): any;
        function _readField(tag: any, obj: any, pbf: any): void;
        function write(obj: any, pbf: any): void;
    }
}
export namespace Market {
    function read(pbf: any, end: any): any;
    function _readField(tag: any, obj: any, pbf: any): void;
    function write(obj: any, pbf: any): void;
}
