/*global expect*/
describe('array-like type', function () {
    describe('with a subtype that disables indentation', function () {
        var clonedExpect = expect.clone();

        clonedExpect.addType({
            base: 'array-like',
            name: 'bogusarray',
            identify: Array.isArray,
            indent: false
        });

        it('should not render the indentation when an instance is inspected in a multi-line context', function () {
            expect(clonedExpect.inspect(['aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb']).toString(), 'to equal', "[\n" + "'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',\n" + "'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'\n" + "]");
        });

        it('should not render the indentation when an instance is diffed', function () {
            expect(clonedExpect.diff(['a', 'b'], ['aa', 'bb']).toString(), 'to equal', "[\n" + "'a', // should equal 'aa'\n" + "     //\n" + "     // -a\n" + "     // +aa\n" + "'b' // should equal 'bb'\n" + "    //\n" + "    // -b\n" + "    // +bb\n" + "]");
        });

        it('should not render the indentation when an instance participates in a "to satisfy" diff', function () {
            expect(function () {
                clonedExpect(['aaa', 'bbb'], 'to satisfy', { 0: 'foo' });
            }, 'to throw', "expected [ 'aaa', 'bbb' ] to satisfy { 0: 'foo' }\n" + "\n" + "[\n" + "'aaa', // should equal 'foo'\n" + "       //\n" + "       // -aaa\n" + "       // +foo\n" + "'bbb'\n" + "]");
        });
    });

    describe('with a subtype that renders an empty prefix and an empty suffix', function () {
        var clonedExpect = expect.clone();

        clonedExpect.addType({
            base: 'array-like',
            name: 'bogusarray',
            identify: Array.isArray,
            prefix: function prefix(output) {
                return output;
            },
            suffix: function suffix(output) {
                return output;
            }
        });

        it('should not render the prefix, suffix, and the newlines when an instance is inspected in a multi-line context', function () {
            expect(clonedExpect.inspect(['aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb']).toString(), 'to equal', "  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',\n" + "  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'");
        });

        it('should not render the prefix, suffix, and the newlines when an instance is diffed', function () {
            expect(clonedExpect.diff(['a', 'b'], ['aa', 'bb']).toString(), 'to equal', "  'a', // should equal 'aa'\n" + "       //\n" + "       // -a\n" + "       // +aa\n" + "  'b' // should equal 'bb'\n" + "      //\n" + "      // -b\n" + "      // +bb");
        });

        it('should not render the prefix, suffix, and the newlines when an instance participates in a "to satisfy" diff', function () {
            expect(function () {
                clonedExpect(['aaa', 'bbb'], 'to satisfy', { 0: 'foo' });
            }, 'to throw', "expected 'aaa', 'bbb' to satisfy { 0: 'foo' }\n" + "\n" + "  'aaa', // should equal 'foo'\n" + "         //\n" + "         // -aaa\n" + "         // +foo\n" + "  'bbb'");
        });
    });

    describe('with a subtype that forces forceMultipleLines mode', function () {
        var clonedExpect = expect.clone();

        clonedExpect.addType({
            base: 'array-like',
            name: 'bogusarray',
            identify: Array.isArray,
            forceMultipleLines: true
        });

        it('should inspect in forceMultipleLines mode despite being able to render on one line', function () {
            expect(clonedExpect.inspect(['a', 'b']).toString(), 'to equal', "[\n" + "  'a',\n" + "  'b'\n" + "]");
        });
    });

    function toArguments() {
        return arguments;
    }

    describe('when both types have numericalPropertiesOnly set', function () {
        it('should only compare numerical properties for equality', function () {
            var a = toArguments(1, 2);
            var b = toArguments(1, 2);
            b.foo = 123;
            expect(a, 'to equal', b);
        });

        it('should fail when a numerical property has different values', function () {
            var a = toArguments(1, 3);
            var b = toArguments(1, 2);
            expect(a, 'not to equal', b);
        });
    });

    describe('with a custom subtype that comes with its own getKeys', function () {
        it('should bar', function () {
            var a = ['a'];
            var b = ['a'];

            var clonedExpect = expect.clone().addType({
                name: 'foo',
                base: 'array-like',
                identify: Array.isArray,
                numericalPropertiesOnly: false,
                getKeys: function getKeys(obj) {
                    var keys = this.baseType.getKeys(obj);
                    if (obj === a) {
                        keys.push('foobar');
                    }
                    return keys;
                }
            });
            expect(function () {
                clonedExpect(a, 'to equal', b);
            }, 'to throw', "expected [ 'a', foobar: undefined ] to equal [ 'a' ]\n" + "\n" + "[\n" + "  'a'\n" + "  // missing foobar: undefined\n" + "]");
        });
    });

    it('should inspect as [...] at depth 2+', function () {
        expect([[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]]], 'to inspect as', '[ [ [...] ] ]');
    });

    it('should render a moved item with an arrow', function () {
        expect(function () {
            expect(['a', 'b', 'c'], 'to equal', ['c', 'a', 'b']);
        }, 'to error with', "expected [ 'a', 'b', 'c' ] to equal [ 'c', 'a', 'b' ]\n" + "\n" + "[\n" + "┌─▷\n" + "│   'a',\n" + "│   'b',\n" + "└── 'c' // should be moved\n" + "]");
    });

    it('should stop rendering more arrows when there would be more than 3 lanes', function () {
        expect(function () {
            expect(['a', 'b', 'c', 'd', 'e', 'f'], 'to equal', ['f', 'c', 'd', 'e', 'a', 'b']);
        }, 'to error with', "expected [ 'a', 'b', 'c', 'd', 'e', 'f' ] to equal [ 'f', 'c', 'd', 'e', 'a', 'b' ]\n" + "\n" + "[\n" + "        // missing 'f'\n" + "┌─────▷\n" + "│ ┌───▷\n" + "│ │ ┌─▷\n" + "│ │ │   'a',\n" + "│ │ │   'b',\n" + "└─│─│── 'c', // should be moved\n" + "  └─│── 'd', // should be moved\n" + "    └── 'e', // should be moved\n" + "        'f' // should be removed\n" + "]");
    });

    it('should render multiple moved items with arrows', function () {
        expect(function () {
            expect(['a', 'b', 'c', 'd'], 'to equal', ['d', 'b', 'a', 'c']);
        }, 'to error with', "expected [ 'a', 'b', 'c', 'd' ] to equal [ 'd', 'b', 'a', 'c' ]\n" + "\n" + "[\n" + "┌───▷\n" + "│ ┌─▷\n" + "│ │   'a',\n" + "│ └── 'b', // should be moved\n" + "│     'c',\n" + "└──── 'd' // should be moved\n" + "]");
    });

    it('should render 3 moved neighbor items', function () {
        expect(function () {
            expect(['a', 'b', 'c', 'd', 'e'], 'to equal', ['c', 'd', 'e', 'a', 'b']);
        }, 'to error with', "expected [ 'a', 'b', 'c', 'd', 'e' ] to equal [ 'c', 'd', 'e', 'a', 'b' ]\n" + "\n" + "[\n" + "┌─────▷\n" + "│ ┌───▷\n" + "│ │ ┌─▷\n" + "│ │ │   'a',\n" + "│ │ │   'b',\n" + "└─│─│── 'c', // should be moved\n" + "  └─│── 'd', // should be moved\n" + "    └── 'e' // should be moved\n" + "]");
    });
});