'use strict';
var ako = ako || {};

function _make_indent(p_indent, p_size){
    return p_indent.repeat(p_size);
}

/**
 * Private serialize function.
 * @param {*} p_thing
 * @param {string} p_indent
 * @param {number} p_cur_indent
 * @param {boolean} p_firstrun
 * @returns {string}
 * @private
 */
function _serialize(p_thing, p_indent, p_cur_indent, p_firstrun = false){
    let s;
    if(p_thing === true){
        return '+';
    }else if (p_thing === false){
        return '-';
    }else if (p_thing === null){
        return ';';
    }

    var end_statement = "";
    if(p_indent.length !== 0){
        end_statement += "\n";
    }else{
        end_statement += " ";
    }

    if(Array.isArray(p_thing)){
        if(p_thing.length === 0){
            return "[[]]";
        }

        s = "";

        if(p_thing.length <= 4 && !p_thing.some(isNaN))
        {
            //Valid ako vector.
            for (let i = 0; i < p_thing.length; i++) {
                // format is {}x{}x{} and we cant end on an x
                if(i === p_thing.length - 1){
                    //End
                    s += p_thing[i];
                }
                else
                {
                    s += p_thing[i] + 'x';
                }
            }
            return s;
        }

        s = "[[" + end_statement;
        p_thing.forEach((elem) => {
            s += _make_indent(p_indent, p_cur_indent + 1) + _serialize(elem, p_indent, p_cur_indent + 1) + end_statement;
        });
        s += _make_indent(p_indent, p_cur_indent) + "]]";
        return s;
    }
    if(typeof p_thing === 'object'){
        s = "";
        var indent_stringing = 0;
        if(!p_firstrun){
            s += "[" + end_statement;
            indent_stringing = p_cur_indent + 1;
        }

        for(const [key, value] of Object.entries(p_thing)){
            var keystr = key.toString();
            var valuestr = _serialize(value, p_indent, indent_stringing);

            var indent = "";
            if(p_firstrun){
                indent = _make_indent(p_indent, 0);
            }else{
                indent = _make_indent(p_indent, p_cur_indent + 1);
            }

            if(valuestr === "-" || valuestr === "+" || valuestr === ";"){
                s += indent + valuestr + keystr;
            }else{
                s += indent + keystr + " " + valuestr;
            }

            s += end_statement;
        }

        s += _make_indent(p_indent, p_cur_indent);
        if(!p_firstrun){
            s += "]";
        }
        return s;
    }

    if(typeof p_thing === 'string'){
        return JSON.stringify(p_thing);
    }

    return p_thing.toString();
}

/**
 * @typedef {number} TokenType
 * @enum {number}
 */
const TokenType = Object.freeze({
    None: 0,
    Bool: 1,
    Int: 2,
    Float: 3,
    String: 4,
    Identifier: 5,
    Dot: 6,
    Semicolon: 7,
    And: 8,
    OpenBrace: 9,
    CloseBrace: 10,
    OpenDBrace: 11,
    CloseDBrace: 12,
});

/**
 * @typedef {Object} TextLocation
 * @property {number} line
 * @property {number} column
 */

/**
 *
 * @param {TextLocation} p_textloc
 * @private
 */
function _fmt_text_location(p_textloc)
{
    return p_textloc.line + ':' + p_textloc.column;
}

/**
 * @typedef {Object} Token
 * @property {TokenType} type - The type of the token.
 * @property {*} value - The value of the token.
 * @property {TextLocation} locStart -
 * @property {TextLocation} locEnd -
 */

/**
 * Make a token with a type and value.
 * @param {TokenType} p_token_type
 * @param {*} p_value
 * @param {TextLocation|null} p_start
 * @param {TextLocation|null} p_end
 * @return {Token}
 * @private
 */
function _make_token(p_token_type, p_value = null, p_start = null, p_end = null)
{
    return {
        type: p_token_type,
        value: p_value,
        locStart: structuredClone(p_start),
        locEnd: structuredClone(p_end),
    }
}

function isalpha(ch){
    return /^[A-Z]$/i.test(ch);
}

function isalphanum(ch){
    return /^[A-Z0-9]$/i.test(ch);
}

function isdigit(ch){
    return /^[0-9]$/i.test(ch);
}

/**
 * Private tokenize function.
 * @param {string} p_src
 * @returns {Array<>}
 * @private
 */
function _tokenize(p_src)
{
    let index = 0;

    /** @type {TextLocation} */
    let startRegion = {line: 1, column: 1};
    /** @type {TextLocation} */
    let currentLocation = {line: 1, column: 1};

    /** Makes a location using
     * @returns {TextLocation} */
    function setStartRegion()
    {
        startRegion.line = currentLocation.line;
        startRegion.column = currentLocation.column;
    }

    function consume() {
        if(index >= p_src.length)
        {
            return '\0';
        }

        const next = p_src[index++];
        if(next === '\n')
        {
            currentLocation.line++;
            currentLocation.column = 1;
        }
        else if(next === '\t')
        {
            currentLocation.column++;
        }
        else{
            currentLocation.column++;
        }

        return next;
    }

    function peek(p_offset = 0)
    {
        if(index + p_offset >= p_src.length)
        {
            return null;
        }
        return p_src[index + p_offset];
    }

    /** @type {[Token]}*/
    var tokens = [];
    while (peek() !== null)
    {
        const c = peek();
        if(c === ' ' || c === '\n' || c === '\t')
        {
            consume();
            continue;
        }

        setStartRegion();

        switch (c)
        {
            case '+':
            case '-':
                consume();
                tokens.push(_make_token(TokenType.Bool, c === '+', startRegion, currentLocation));
                continue;
            case ';':
                consume();
                tokens.push(_make_token(TokenType.Semicolon, null, startRegion, currentLocation));
                continue;
            case '.':
                consume();
                tokens.push(_make_token(TokenType.Dot, null, startRegion, currentLocation));
                continue;
            case '&':
                consume();
                tokens.push(_make_token(TokenType.And, null, startRegion, currentLocation));
                continue;
            case '[':
                consume();
                if(peek() !== null && peek() === '[')
                {
                    consume();
                    tokens.push(_make_token(TokenType.OpenDBrace, null, startRegion, currentLocation));
                    continue;
                }
                tokens.push(_make_token(TokenType.OpenBrace, null, startRegion, currentLocation));
                continue;
            case ']':
                consume();
                if(peek() !== null && peek() === ']')
                {
                    consume();
                    tokens.push(_make_token(TokenType.CloseDBrace, null, startRegion, currentLocation));
                    continue;
                }
                tokens.push(_make_token(TokenType.CloseBrace, null, startRegion, currentLocation));
                continue;
        }

        if(isalpha(c) || c === '_')
        {
            var identifier = "";
            while (peek() !== null && (isalphanum(peek()) || peek() === '_'))
            {
                identifier += consume();
            }
            tokens.push(_make_token(TokenType.Identifier, identifier, startRegion, currentLocation));
            continue;
        }

        if(isdigit(c))
        {
            var num = "";
            while(peek() !== null && isdigit(peek()))
            {
                num += consume();
            }
            if(peek() !== null && peek() === '.')
            {
                num += consume();
                while (peek() !== null && isdigit(peek()))
                {
                    num += consume();
                }
                tokens.push(_make_token(TokenType.Float, Number(num), startRegion, currentLocation));
            }
            else
            {
                tokens.push(_make_token(TokenType.Int, Number(num), startRegion, currentLocation));
            }
            continue;
        }

        if(c === '"')
        {
            consume();
            var str = "";
            while (peek() !== null && peek() !== '"')
            {
                if(peek() === '\\')
                {
                    consume();
                    if(peek() === null)
                    {
                        //nothing
                        str += '\\';
                    }
                    else
                    {
                        switch (peek())
                        {
                            case 'n':
                                str += '\n';
                                break;
                            default:
                                str += peek();
                                break;
                        }
                        consume();
                    }
                }
                else
                {
                    str += consume();
                }
            }
            consume();
            tokens.push(_make_token(TokenType.String, str, startRegion, currentLocation));
            continue;
        }
    }

    return tokens;
}

/**
 * Private parse function/
 * @param {Array<Token>} p_tokens
 * @returns {Object|Array|null}
 * @private
 */
function _parse(p_tokens)
{
    let index = 0;

    function consume() {
        if(index >= p_tokens.length)
        {
            return '\0';
        }
        return p_tokens[index++];
    }

    function peek(p_offset = 0)
    {
        if(index + p_offset >= p_tokens.length)
        {
            return null;
        }
        return p_tokens[index + p_offset];
    }

    /**
     * @param {TokenType} type
     * @param {number} offset
     */
    function checkPeekType(type, offset = 0)
    {
        const peeked = peek(offset);
        if(peeked === null)
            return false;

        return peeked.type === type;
    }

    function parseValue()
    {
        switch (peek().type)
        {
            case TokenType.OpenDBrace:
                return parseArray();
            case TokenType.OpenBrace:
                return parseTable();
            case TokenType.Semicolon:
            case TokenType.Bool:
            case TokenType.Int:
            case TokenType.Float:
            case TokenType.String:
                return consume().value;
            default:
                throw new Error('Unsupported type "' + peek().type + '" at ' + _fmt_text_location(peek().locStart));
        }
    }

    function parseArray()
    {
        if(peek() !== null && peek().type === TokenType.OpenDBrace)
        {
            consume();
        }
        else
        {
            throw new Error("Open double brace expected");
        }

        var array = [];

        while (peek() !== null && peek().type !== TokenType.CloseDBrace)
        {
            array.push(parseValue());
        }

        if(peek() !== null && peek().type === TokenType.CloseDBrace)
        {
            consume();
            return array;
        }
        else
        {
            throw new Error("Expected close double brace.");
        }
    }

    function parseTable(ignoreBraces = false)
    {
        if(!ignoreBraces)
        {
            if(peek() !== null && peek().type === TokenType.OpenBrace)
            {
                consume();
            }
            else
            {
                throw new Error("Expected open brace.");
            }
        }

        var table = {};

        while (peek() !== null && peek().type !== TokenType.CloseBrace)
        {
            //We need {id, value} or {value, id}
            if(peek(0) === null || peek(1) === null)
            {
                throw new Error("Expected two tokens, got only one or zero token(s)");
            }

            const firstPeekType = peek().type;
            if(!(
                firstPeekType === TokenType.Identifier ||
                firstPeekType === TokenType.String ||
                firstPeekType === TokenType.Bool ||
                firstPeekType === TokenType.Semicolon))
            {
                throw new Error("Expected an identifier, bool or null.");
            }

            parseTableElement(table);
        }

        if(!ignoreBraces)
        {
            if(peek() !== null && peek().type === TokenType.CloseBrace)
            {
                consume();
                return table;
            }
            else
            {
                throw new Error("Expected closing brace for table.");
            }
        }
        else
        {
            return table;
        }
    }

    function parseTableElement(table)
    {
        if(peek() === null)
        {
            throw new Error("Expected a token, got none");
        }

        /** @type {null|Token}*/
        var valueFirst = null;
        if(peek().type === TokenType.Bool || peek().type === TokenType.Semicolon)
        {
            valueFirst = consume();
        }

        if(!(peek().type === TokenType.Identifier || peek().type === TokenType.String))
        {
            throw new Error("Expected an identifier or string.");
        }

        var currentTable = table;
        var CTValueId = null;
        while (peek() !== null && (peek().type === TokenType.Identifier || peek().type === TokenType.String))
        {
            var id = consume().value;
            var stillMore = checkPeekType(TokenType.Dot);

            if(!stillMore)
            {
                //At the last identifier
                //we can get the value from the table
                if(!(id in currentTable))
                {
                    currentTable[id] = null;
                }
                CTValueId = id;
                break;
            }
            else
            {
                //Not at the last id
                if(!(id in currentTable))
                {
                    currentTable[id] = {};
                }
                currentTable = currentTable[id];
            }

            if(peek() !== null && peek().type === TokenType.Dot)
            {
                consume();
            }
        }

        if(CTValueId === null)
        {
            throw new Error("Failed to get table id");
        }

        if(valueFirst !== null)
        {
            //value is first
            currentTable[CTValueId] = valueFirst.value;
        }
        else
        {
            currentTable[CTValueId] = parseValue();
        }
    }

    if(peek() === null)
    {
        //Nothing to parse
        return null;
    }

    if(peek().type === TokenType.OpenDBrace)
    {
        return parseArray();
    }
    else
    {
        var shouldIgnoreBraces = true;
        if(peek().type === TokenType.OpenBrace)
        {
            shouldIgnoreBraces = false;
        }

        return parseTable(shouldIgnoreBraces);
    }
}

//public serialise.
ako.serialize = function(thing, do_formatting = true, use_spaces = false){
    var fmt = "\t";
    if(use_spaces && do_formatting)
    {
        fmt = "    ";
    }
    else if(!do_formatting)
    {
        fmt = "";
    }
    return _serialize(thing, fmt, 0, true);
};

/**
 * Parse Ako string into a JS Object or Array.
 * @param {string} src
 * @returns {Object | Array | null}
 */
ako.parse = function(src) {
    return _parse(_tokenize(src));
}

export default ako;