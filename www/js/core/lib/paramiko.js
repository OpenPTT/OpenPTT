// Source: common.js
define([], function () {

function paramikojs() { }
paramikojs = {
  MSG_DISCONNECT : 1,
  MSG_IGNORE : 2,
  MSG_UNIMPLEMENTED : 3,
  MSG_DEBUG : 4,
  MSG_SERVICE_REQUEST : 5,
  MSG_SERVICE_ACCEPT : 6,

  MSG_KEXINIT : 20,
  MSG_NEWKEYS : 21,

  MSG_USERAUTH_REQUEST : 50,
  MSG_USERAUTH_FAILURE : 51,
  MSG_USERAUTH_SUCCESS : 52,
  MSG_USERAUTH_BANNER  : 53,

  MSG_USERAUTH_PK_OK : 60,

  MSG_USERAUTH_INFO_REQUEST : 60,
  MSG_USERAUTH_INFO_RESPONSE : 61,

  MSG_GLOBAL_REQUEST : 80,
  MSG_REQUEST_SUCCESS : 81,
  MSG_REQUEST_FAILURE : 82,

  MSG_CHANNEL_OPEN : 90,
  MSG_CHANNEL_OPEN_SUCCESS : 91,
  MSG_CHANNEL_OPEN_FAILURE : 92,
  MSG_CHANNEL_WINDOW_ADJUST : 93,
  MSG_CHANNEL_DATA : 94,
  MSG_CHANNEL_EXTENDED_DATA : 95,
  MSG_CHANNEL_EOF : 96,
  MSG_CHANNEL_CLOSE : 97,
  MSG_CHANNEL_REQUEST : 98,
  MSG_CHANNEL_SUCCESS : 99,
  MSG_CHANNEL_FAILURE : 100,

  // for debugging:
  MSG_NAMES : {
    1: 'disconnect',
    2: 'ignore',
    3: 'unimplemented',
    4: 'debug',
    5: 'service-request',
    6: 'service-accept',
    20: 'kexinit',
    21: 'newkeys',
    30: 'kex30',
    31: 'kex31',
    32: 'kex32',
    33: 'kex33',
    34: 'kex34',
    50: 'userauth-request',
    51: 'userauth-failure',
    52: 'userauth-success',
    53: 'userauth--banner',
    60: 'userauth-60(pk-ok/info-request)',
    61: 'userauth-info-response',
    80: 'global-request',
    81: 'request-success',
    82: 'request-failure',
    90: 'channel-open',
    91: 'channel-open-success',
    92: 'channel-open-failure',
    93: 'channel-window-adjust',
    94: 'channel-data',
    95: 'channel-extended-data',
    96: 'channel-eof',
    97: 'channel-close',
    98: 'channel-request',
    99: 'channel-success',
    100: 'channel-failure'
  },

  // authentication request return codes:
  AUTH_SUCCESSFUL : 0,
  AUTH_PARTIALLY_SUCCESSFUL : 1,
  AUTH_FAILED : 2,

  // channel request failed reasons:
  OPEN_SUCCEEDED : 0,
  OPEN_FAILED_ADMINISTRATIVELY_PROHIBITED : 1,
  OPEN_FAILED_CONNECT_FAILED : 2,
  OPEN_FAILED_UNKNOWN_CHANNEL_TYPE : 3,
  OPEN_FAILED_RESOURCE_SHORTAGE : 4,

  CONNECTION_FAILED_CODE : {
    1: 'Administratively prohibited',
    2: 'Connect failed',
    3: 'Unknown channel type',
    4: 'Resource shortage'
  },

  DISCONNECT_SERVICE_NOT_AVAILABLE : 7,
  DISCONNECT_AUTH_CANCELLED_BY_USER : 13,
  DISCONNECT_NO_MORE_AUTH_METHODS_AVAILABLE : 14
};

function inherit(derived, base) {
  for (property in base) {
    if (!derived[property]) {
      derived[property] = base[property];
    }
  }
}

var logging = {
  DEBUG : 10,
  INFO : 20,
  WARNING : 30,
  ERROR : 40,
  CRITICAL : 50,

  log : function(level, msg) {
    /* Override this as desired. */
  }
};
DEBUG = logging.DEBUG;
INFO = logging.INFO;
WARNING = logging.WARNING;
ERROR = logging.ERROR;
CRITICAL = logging.CRITICAL;

var ssh_console = {
  log: false,
  info: false,
  debug: false,
  error: false,
  warn: false
};

// Source: kryptos/kryptos.js
kryptos = function() {};
kryptos.prototype = {};

kryptos.cipher    = {};
kryptos.hash      = {};
kryptos.protocol  = {};
kryptos.publicKey = {};
kryptos.random    = {};
kryptos.random.Fortuna = {};
kryptos.random.OSRNG = {};
kryptos.util      = {};

kryptos.toByteArray = function(str) {
  function charToUint(chr) { return chr.charCodeAt(0) }
  return str.split('').map(charToUint);
};

kryptos.fromByteArray = function(data) {
  function uintToChar(uint) { return String.fromCharCode(uint) }
  return data.map(uintToChar).join('');
};

kryptos.bytesToWords = function(bytes) {
  for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8) {
    words[b >>> 5] |= (bytes[i] & 0xFF) << (24 - b % 32);
  }
  return words;
};

kryptos.wordsToBytes = function(words) {
  for (var bytes = [], b = 0; b < words.length * 32; b += 8) {
    bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
  }
  return bytes;
};

// Source: kryptos/Cipher/AES.js
/** @fileOverview Low-level AES implementation.
 *
 * This file contains a low-level implementation of AES, optimized for
 * size and for efficiency on several browsers.  It is based on
 * OpenSSL's aes_core.c, a public-domain implementation by Vincent
 * Rijmen, Antoon Bosselaers and Paulo Barreto.
 *
 * An older version of this implementation is available in the public
 * domain, but this one is (c) Emily Stark, Mike Hamburg, Dan Boneh,
 * Stanford University 2008-2010 and BSD-licensed for liability
 * reasons.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/**
 * Schedule out an AES key for both encryption and decryption.  This
 * is a low-level class.  Use a cipher mode to do bulk encryption.
 *
 * @constructor
 * @param {Array} key The key as an array of 4, 6 or 8 words.
 *
 * @class Advanced Encryption Standard (low-level interface)
 */
sjcl = {};
sjcl.cipher = {};
sjcl.cipher.aes = function (key, mode) {
  if (!this._tables[0][0][0]) {
    this._precompute();
  }

  this.mode = mode;

  var i, j, tmp,
    encKey, decKey,
    sbox = this._tables[0][4], decTable = this._tables[1],
    keyLen = key.length, rcon = 1;

  if (keyLen !== 4 && keyLen !== 6 && keyLen !== 8) {
    throw "invalid aes key size";
  }

  this._key = [encKey = key.slice(0), decKey = []];

  // schedule encryption keys
  for (i = keyLen; i < 4 * keyLen + 28; i++) {
    tmp = encKey[i-1];

    // apply sbox
    if (i%keyLen === 0 || (keyLen === 8 && i%keyLen === 4)) {
      tmp = sbox[tmp>>>24]<<24 ^ sbox[tmp>>16&255]<<16 ^ sbox[tmp>>8&255]<<8 ^ sbox[tmp&255];

      // shift rows and add rcon
      if (i%keyLen === 0) {
        tmp = tmp<<8 ^ tmp>>>24 ^ rcon<<24;
        rcon = rcon<<1 ^ (rcon>>7)*283;
      }
    }

    encKey[i] = encKey[i-keyLen] ^ tmp;
  }

  // schedule decryption keys
  for (j = 0; i; j++, i--) {
    tmp = encKey[j&3 ? i : i - 4];
    if (i<=4 || j<4) {
      decKey[j] = tmp;
    } else {
      decKey[j] = decTable[0][sbox[tmp>>>24      ]] ^
                  decTable[1][sbox[tmp>>16  & 255]] ^
                  decTable[2][sbox[tmp>>8   & 255]] ^
                  decTable[3][sbox[tmp      & 255]];
    }
  }
};

sjcl.cipher.aes.MODE_CBC = 2;
sjcl.cipher.aes.MODE_CTR = 6;

sjcl.cipher.aes.prototype = {
  // public
  /* Something like this might appear here eventually
  name: "AES",
  blockSize: 4,
  keySizes: [4,6,8],
  */

  /**
   * Encrypt an array of 4 big-endian words.
   * @param {Array} data The plaintext.
   * @return {Array} The ciphertext.
   */
  encrypt:function (data, iv, counter) {
    var ct = this.mode == sjcl.cipher.aes.MODE_CBC ? iv : [];

    var ret = [];

    for (var block = 0; block < data.length / 16; block++) {
      var aBlock = data.slice(block * 16, (block + 1) * 16);
      if (this.mode == sjcl.cipher.aes.MODE_CBC) {
        for (var i = 0; i < 16; i++) {
          aBlock[i] ^= ct[i];
        }
        ct = sjcl.codec.bytes.fromBits(this._crypt(sjcl.codec.bytes.toBits(aBlock),0));
      } else {
        ct = sjcl.codec.bytes.fromBits(this._crypt(sjcl.codec.bytes.toBits(kryptos.toByteArray(counter.call())),0));
        for (var i = 0; i < 16; i++) {
          ct[i] ^= aBlock[i];
        }
      }
      ret = ret.concat(ct);
    }

    return ret;
  },

  /**
   * Decrypt an array of 4 big-endian words.
   * @param {Array} data The ciphertext.
   * @return {Array} The plaintext.
   */
  decrypt:function (data, iv) {
    var ret = [];

    for (var block = 0; block < data.length / 16; block++) {
      var aBlock = data.slice(block * 16, (block + 1) * 16);
      ct = sjcl.codec.bytes.fromBits(this._crypt(sjcl.codec.bytes.toBits(aBlock),1));
      if (this.mode == sjcl.cipher.aes.MODE_CBC) {
        for (var i = 0; i < 16; i++) {
          ct[i] ^= iv[i];
        }
        iv = aBlock;
      }
      ret = ret.concat(ct);
    }
    return ret;
  },

  /**
   * The expanded S-box and inverse S-box tables.  These will be computed
   * on the client so that we don't have to send them down the wire.
   *
   * There are two tables, _tables[0] is for encryption and
   * _tables[1] is for decryption.
   *
   * The first 4 sub-tables are the expanded S-box with MixColumns.  The
   * last (_tables[01][4]) is the S-box itself.
   *
   * @private
   */
  _tables: [[[],[],[],[],[]],[[],[],[],[],[]]],

  /**
   * Expand the S-box tables.
   *
   * @private
   */
  _precompute: function () {
   var encTable = this._tables[0], decTable = this._tables[1],
       sbox = encTable[4], sboxInv = decTable[4],
       i, x, xInv, d=[], th=[], x2, x4, x8, s, tEnc, tDec;

    // Compute double and third tables
   for (i = 0; i < 256; i++) {
     th[( d[i] = i<<1 ^ (i>>7)*283 )^i]=i;
   }

   for (x = xInv = 0; !sbox[x]; x ^= x2 || 1, xInv = th[xInv] || 1) {
     // Compute sbox
     s = xInv ^ xInv<<1 ^ xInv<<2 ^ xInv<<3 ^ xInv<<4;
     s = s>>8 ^ s&255 ^ 99;
     sbox[x] = s;
     sboxInv[s] = x;

     // Compute MixColumns
     x8 = d[x4 = d[x2 = d[x]]];
     tDec = x8*0x1010101 ^ x4*0x10001 ^ x2*0x101 ^ x*0x1010100;
     tEnc = d[s]*0x101 ^ s*0x1010100;

     for (i = 0; i < 4; i++) {
       encTable[i][x] = tEnc = tEnc<<24 ^ tEnc>>>8;
       decTable[i][s] = tDec = tDec<<24 ^ tDec>>>8;
     }
   }

   // Compactify.  Considerable speedup on Firefox.
   for (i = 0; i < 5; i++) {
     encTable[i] = encTable[i].slice(0);
     decTable[i] = decTable[i].slice(0);
   }
  },

  /**
   * Encryption and decryption core.
   * @param {Array} input Four words to be encrypted or decrypted.
   * @param dir The direction, 0 for encrypt and 1 for decrypt.
   * @return {Array} The four encrypted or decrypted words.
   * @private
   */
  _crypt:function (input, dir) {
    if (input.length !== 4) {
      throw "invalid aes block size";
    }

    var key = this._key[dir],
        // state variables a,b,c,d are loaded with pre-whitened data
        a = input[0]           ^ key[0],
        b = input[dir ? 3 : 1] ^ key[1],
        c = input[2]           ^ key[2],
        d = input[dir ? 1 : 3] ^ key[3],
        a2, b2, c2,

        nInnerRounds = key.length/4 - 2,
        i,
        kIndex = 4,
        out = [0,0,0,0],
        table = this._tables[dir],

        // load up the tables
        t0    = table[0],
        t1    = table[1],
        t2    = table[2],
        t3    = table[3],
        sbox  = table[4];

    // Inner rounds.  Cribbed from OpenSSL.
    for (i = 0; i < nInnerRounds; i++) {
      a2 = t0[a>>>24] ^ t1[b>>16 & 255] ^ t2[c>>8 & 255] ^ t3[d & 255] ^ key[kIndex];
      b2 = t0[b>>>24] ^ t1[c>>16 & 255] ^ t2[d>>8 & 255] ^ t3[a & 255] ^ key[kIndex + 1];
      c2 = t0[c>>>24] ^ t1[d>>16 & 255] ^ t2[a>>8 & 255] ^ t3[b & 255] ^ key[kIndex + 2];
      d  = t0[d>>>24] ^ t1[a>>16 & 255] ^ t2[b>>8 & 255] ^ t3[c & 255] ^ key[kIndex + 3];
      kIndex += 4;
      a=a2; b=b2; c=c2;
    }

    // Last round.
    for (i = 0; i < 4; i++) {
      out[dir ? 3&-i : i] =
        sbox[a>>>24      ]<<24 ^
        sbox[b>>16  & 255]<<16 ^
        sbox[c>>8   & 255]<<8  ^
        sbox[d      & 255]     ^
        key[kIndex++];
      a2=a; a=b; b=c; c=d; d=a2;
    }

    return out;
  }
};

/** @fileOverview Bit array codec implementations.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/** @namespace Arrays of bytes */
sjcl.codec = {};
sjcl.codec.bytes = {
  /** Convert from a bitArray to an array of bytes. */
  fromBits: function (arr) {
    var out = [], bl = sjcl.bitArray.bitLength(arr), i, tmp;
    for (i=0; i<bl/8; i++) {
      if ((i&3) === 0) {
        tmp = arr[i/4];
      }
      out.push(tmp >>> 24);
      tmp <<= 8;
    }
    return out;
  },
  /** Convert from an array of bytes to a bitArray. */
  toBits: function (bytes) {
    var out = [], i, tmp=0;
    for (i=0; i<bytes.length; i++) {
      tmp = tmp << 8 | bytes[i];
      if ((i&3) === 3) {
        out.push(tmp);
        tmp = 0;
      }
    }
    if (i&3) {
      out.push(sjcl.bitArray.partial(8*(i&3), tmp));
    }
    return out;
  }
};


/** @fileOverview Arrays of bits, encoded as arrays of Numbers.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/** @namespace Arrays of bits, encoded as arrays of Numbers.
 *
 * @description
 * <p>
 * These objects are the currency accepted by SJCL's crypto functions.
 * </p>
 *
 * <p>
 * Most of our crypto primitives operate on arrays of 4-byte words internally,
 * but many of them can take arguments that are not a multiple of 4 bytes.
 * This library encodes arrays of bits (whose size need not be a multiple of 8
 * bits) as arrays of 32-bit words.  The bits are packed, big-endian, into an
 * array of words, 32 bits at a time.  Since the words are double-precision
 * floating point numbers, they fit some extra data.  We use this (in a private,
 * possibly-changing manner) to encode the number of bits actually  present
 * in the last word of the array.
 * </p>
 *
 * <p>
 * Because bitwise ops clear this out-of-band data, these arrays can be passed
 * to ciphers like AES which want arrays of words.
 * </p>
 */
sjcl.bitArray = {
  /**
   * Find the length of an array of bits.
   * @param {bitArray} a The array.
   * @return {Number} The length of a, in bits.
   */
  bitLength: function (a) {
    var l = a.length, x;
    if (l === 0) { return 0; }
    x = a[l - 1];
    return (l-1) * 32 + sjcl.bitArray.getPartial(x);
  },

  /**
   * Make a partial word for a bit array.
   * @param {Number} len The number of bits in the word.
   * @param {Number} x The bits.
   * @param {Number} [0] _end Pass 1 if x has already been shifted to the high side.
   * @return {Number} The partial word.
   */
  partial: function (len, x, _end) {
    if (len === 32) { return x; }
    return (_end ? x|0 : x << (32-len)) + len * 0x10000000000;
  },

  /**
   * Get the number of bits used by a partial word.
   * @param {Number} x The partial word.
   * @return {Number} The number of bits used by the partial word.
   */
  getPartial: function (x) {
    return Math.round(x/0x10000000000) || 32;
  }
};



kryptos.cipher.AES = function(key, mode, iv, counter) {
  this.cipher = new sjcl.cipher.aes(sjcl.codec.bytes.toBits(kryptos.toByteArray(key)), mode);
  this.mode = mode;
  if (this.mode == kryptos.cipher.AES.MODE_CBC) {
    this.iv = kryptos.toByteArray(iv);
  }
  this.counter = counter;
};

kryptos.cipher.AES.MODE_CTR = 6;
kryptos.cipher.AES.MODE_CBC = 2;

kryptos.cipher.AES.prototype = {
  encrypt : function(plaintext) {
    var ciphertext = this.cipher.encrypt(kryptos.toByteArray(plaintext), this.iv, this.counter);
    if (this.mode == kryptos.cipher.AES.MODE_CBC) {
      this.iv = ciphertext.slice(-16);
    }
    return kryptos.fromByteArray(ciphertext);
  },

  decrypt : function(ciphertext) {
    ciphertext = kryptos.toByteArray(ciphertext);
    if (this.mode == kryptos.cipher.AES.MODE_CBC) {
      var plaintext = this.cipher.decrypt(ciphertext, this.iv);
      this.iv = ciphertext.slice(-16);
    } else {
      var plaintext = this.cipher.encrypt(ciphertext, this.iv, this.counter);
    }
    return kryptos.fromByteArray(plaintext);
  }
};

// Source: kryptos/Cipher/Blowfish.js
/*
    jsBFSH - a javascript implementation of bruce schneier's blowfish cipher,
             by robin leffmann (djinn <at> stolendata.net) on 30-mar-2010
             optimized further for speed by mime cuvalo (mimecuvalo@gmail.com)

             key, data and iv should all be arrays holding byte-sized values.
             the data array will be padded with 0s to fit nearest size of /8.
             the iv must be 8 bytes long, or en/decrypt() will return false.
             data will be overwritten during both en- and decryption.
             it is highly recommended to zero out key, context and iv arrays
             after they've been used.

             this source code is released under the cc by-nc-sa license,
             and comes without any warranties of any kind... :-)
             http://creativecommons.org/licenses/by-nc-sa/3.0/

             Special addendum from Robin Leffmann, specifically
             for the FireFTP and FireSSH projects:
             "I don't want to be a hindrance, so I'll gladly make an exception
             for FireSSH and FireFTP and hereby grant you permission to use
             jsBFSH under a license of your choice that accommodates these
             two projects - all I ask is that I'm credited for my work...
             you indeed have my permission to _permanently_ re-license your
             adapted jsBFSH under whatever license you feel is appropriate,
             not just limited to your Fire* projects."

             Thus, under this project, this code is alternatively licensed under
             the cc-by-sa license just so all you legal-minded folks can rest easy at night :)
             See this bug for discussion: https://www.mozdev.org/bugs/show_bug.cgi?id=23881
             http://creativecommons.org/licenses/by-sa/3.0/

             http://en.wikipedia.org/wiki/Blowfish_(cipher)
*/

kryptos.cipher.Blowfish = function (key, mode, iv) {
  this.c = new this.context(kryptos.toByteArray(key));
  this.mode = mode;
  this.originalIv = iv = kryptos.toByteArray(iv);
  this.iv = ( iv[0] << 24 ) | ( iv[1] << 16 ) | ( iv[2] << 8 ) | iv[3];
  this.iv2 = ( iv[4] << 24 ) | ( iv[5] << 16 ) | ( iv[6] << 8 ) | iv[7];
};

kryptos.cipher.Blowfish.MODE_CBC = 2;

kryptos.cipher.Blowfish.prototype = {

    context: function( k )
    {
        this.p = [ 0x243f6a88, 0x85a308d3, 0x13198a2e, 0x03707344, 0xa4093822, 0x299f31d0, 0x082efa98, 0xec4e6c89,
                   0x452821e6, 0x38d01377, 0xbe5466cf, 0x34e90c6c, 0xc0ac29b7, 0xc97c50dd, 0x3f84d5b5, 0xb5470917,
                   0x9216d5d9, 0x8979fb1b ];

        this.s = [ [0xd1310ba6, 0x98dfb5ac, 0x2ffd72db, 0xd01adfb7, 0xb8e1afed, 0x6a267e96, 0xba7c9045, 0xf12c7f99,
                    0x24a19947, 0xb3916cf7, 0x0801f2e2, 0x858efc16, 0x636920d8, 0x71574e69, 0xa458fea3, 0xf4933d7e,
                    0x0d95748f, 0x728eb658, 0x718bcd58, 0x82154aee, 0x7b54a41d, 0xc25a59b5, 0x9c30d539, 0x2af26013,
                    0xc5d1b023, 0x286085f0, 0xca417918, 0xb8db38ef, 0x8e79dcb0, 0x603a180e, 0x6c9e0e8b, 0xb01e8a3e,
                    0xd71577c1, 0xbd314b27, 0x78af2fda, 0x55605c60, 0xe65525f3, 0xaa55ab94, 0x57489862, 0x63e81440,
                    0x55ca396a, 0x2aab10b6, 0xb4cc5c34, 0x1141e8ce, 0xa15486af, 0x7c72e993, 0xb3ee1411, 0x636fbc2a,
                    0x2ba9c55d, 0x741831f6, 0xce5c3e16, 0x9b87931e, 0xafd6ba33, 0x6c24cf5c, 0x7a325381, 0x28958677,
                    0x3b8f4898, 0x6b4bb9af, 0xc4bfe81b, 0x66282193, 0x61d809cc, 0xfb21a991, 0x487cac60, 0x5dec8032,
                    0xef845d5d, 0xe98575b1, 0xdc262302, 0xeb651b88, 0x23893e81, 0xd396acc5, 0x0f6d6ff3, 0x83f44239,
                    0x2e0b4482, 0xa4842004, 0x69c8f04a, 0x9e1f9b5e, 0x21c66842, 0xf6e96c9a, 0x670c9c61, 0xabd388f0,
                    0x6a51a0d2, 0xd8542f68, 0x960fa728, 0xab5133a3, 0x6eef0b6c, 0x137a3be4, 0xba3bf050, 0x7efb2a98,
                    0xa1f1651d, 0x39af0176, 0x66ca593e, 0x82430e88, 0x8cee8619, 0x456f9fb4, 0x7d84a5c3, 0x3b8b5ebe,
                    0xe06f75d8, 0x85c12073, 0x401a449f, 0x56c16aa6, 0x4ed3aa62, 0x363f7706, 0x1bfedf72, 0x429b023d,
                    0x37d0d724, 0xd00a1248, 0xdb0fead3, 0x49f1c09b, 0x075372c9, 0x80991b7b, 0x25d479d8, 0xf6e8def7,
                    0xe3fe501a, 0xb6794c3b, 0x976ce0bd, 0x04c006ba, 0xc1a94fb6, 0x409f60c4, 0x5e5c9ec2, 0x196a2463,
                    0x68fb6faf, 0x3e6c53b5, 0x1339b2eb, 0x3b52ec6f, 0x6dfc511f, 0x9b30952c, 0xcc814544, 0xaf5ebd09,
                    0xbee3d004, 0xde334afd, 0x660f2807, 0x192e4bb3, 0xc0cba857, 0x45c8740f, 0xd20b5f39, 0xb9d3fbdb,
                    0x5579c0bd, 0x1a60320a, 0xd6a100c6, 0x402c7279, 0x679f25fe, 0xfb1fa3cc, 0x8ea5e9f8, 0xdb3222f8,
                    0x3c7516df, 0xfd616b15, 0x2f501ec8, 0xad0552ab, 0x323db5fa, 0xfd238760, 0x53317b48, 0x3e00df82,
                    0x9e5c57bb, 0xca6f8ca0, 0x1a87562e, 0xdf1769db, 0xd542a8f6, 0x287effc3, 0xac6732c6, 0x8c4f5573,
                    0x695b27b0, 0xbbca58c8, 0xe1ffa35d, 0xb8f011a0, 0x10fa3d98, 0xfd2183b8, 0x4afcb56c, 0x2dd1d35b,
                    0x9a53e479, 0xb6f84565, 0xd28e49bc, 0x4bfb9790, 0xe1ddf2da, 0xa4cb7e33, 0x62fb1341, 0xcee4c6e8,
                    0xef20cada, 0x36774c01, 0xd07e9efe, 0x2bf11fb4, 0x95dbda4d, 0xae909198, 0xeaad8e71, 0x6b93d5a0,
                    0xd08ed1d0, 0xafc725e0, 0x8e3c5b2f, 0x8e7594b7, 0x8ff6e2fb, 0xf2122b64, 0x8888b812, 0x900df01c,
                    0x4fad5ea0, 0x688fc31c, 0xd1cff191, 0xb3a8c1ad, 0x2f2f2218, 0xbe0e1777, 0xea752dfe, 0x8b021fa1,
                    0xe5a0cc0f, 0xb56f74e8, 0x18acf3d6, 0xce89e299, 0xb4a84fe0, 0xfd13e0b7, 0x7cc43b81, 0xd2ada8d9,
                    0x165fa266, 0x80957705, 0x93cc7314, 0x211a1477, 0xe6ad2065, 0x77b5fa86, 0xc75442f5, 0xfb9d35cf,
                    0xebcdaf0c, 0x7b3e89a0, 0xd6411bd3, 0xae1e7e49, 0x00250e2d, 0x2071b35e, 0x226800bb, 0x57b8e0af,
                    0x2464369b, 0xf009b91e, 0x5563911d, 0x59dfa6aa, 0x78c14389, 0xd95a537f, 0x207d5ba2, 0x02e5b9c5,
                    0x83260376, 0x6295cfa9, 0x11c81968, 0x4e734a41, 0xb3472dca, 0x7b14a94a, 0x1b510052, 0x9a532915,
                    0xd60f573f, 0xbc9bc6e4, 0x2b60a476, 0x81e67400, 0x08ba6fb5, 0x571be91f, 0xf296ec6b, 0x2a0dd915,
                    0xb6636521, 0xe7b9f9b6, 0xff34052e, 0xc5855664, 0x53b02d5d, 0xa99f8fa1, 0x08ba4799, 0x6e85076a],

                   [0x4b7a70e9, 0xb5b32944, 0xdb75092e, 0xc4192623, 0xad6ea6b0, 0x49a7df7d, 0x9cee60b8, 0x8fedb266,
                    0xecaa8c71, 0x699a17ff, 0x5664526c, 0xc2b19ee1, 0x193602a5, 0x75094c29, 0xa0591340, 0xe4183a3e,
                    0x3f54989a, 0x5b429d65, 0x6b8fe4d6, 0x99f73fd6, 0xa1d29c07, 0xefe830f5, 0x4d2d38e6, 0xf0255dc1,
                    0x4cdd2086, 0x8470eb26, 0x6382e9c6, 0x021ecc5e, 0x09686b3f, 0x3ebaefc9, 0x3c971814, 0x6b6a70a1,
                    0x687f3584, 0x52a0e286, 0xb79c5305, 0xaa500737, 0x3e07841c, 0x7fdeae5c, 0x8e7d44ec, 0x5716f2b8,
                    0xb03ada37, 0xf0500c0d, 0xf01c1f04, 0x0200b3ff, 0xae0cf51a, 0x3cb574b2, 0x25837a58, 0xdc0921bd,
                    0xd19113f9, 0x7ca92ff6, 0x94324773, 0x22f54701, 0x3ae5e581, 0x37c2dadc, 0xc8b57634, 0x9af3dda7,
                    0xa9446146, 0x0fd0030e, 0xecc8c73e, 0xa4751e41, 0xe238cd99, 0x3bea0e2f, 0x3280bba1, 0x183eb331,
                    0x4e548b38, 0x4f6db908, 0x6f420d03, 0xf60a04bf, 0x2cb81290, 0x24977c79, 0x5679b072, 0xbcaf89af,
                    0xde9a771f, 0xd9930810, 0xb38bae12, 0xdccf3f2e, 0x5512721f, 0x2e6b7124, 0x501adde6, 0x9f84cd87,
                    0x7a584718, 0x7408da17, 0xbc9f9abc, 0xe94b7d8c, 0xec7aec3a, 0xdb851dfa, 0x63094366, 0xc464c3d2,
                    0xef1c1847, 0x3215d908, 0xdd433b37, 0x24c2ba16, 0x12a14d43, 0x2a65c451, 0x50940002, 0x133ae4dd,
                    0x71dff89e, 0x10314e55, 0x81ac77d6, 0x5f11199b, 0x043556f1, 0xd7a3c76b, 0x3c11183b, 0x5924a509,
                    0xf28fe6ed, 0x97f1fbfa, 0x9ebabf2c, 0x1e153c6e, 0x86e34570, 0xeae96fb1, 0x860e5e0a, 0x5a3e2ab3,
                    0x771fe71c, 0x4e3d06fa, 0x2965dcb9, 0x99e71d0f, 0x803e89d6, 0x5266c825, 0x2e4cc978, 0x9c10b36a,
                    0xc6150eba, 0x94e2ea78, 0xa5fc3c53, 0x1e0a2df4, 0xf2f74ea7, 0x361d2b3d, 0x1939260f, 0x19c27960,
                    0x5223a708, 0xf71312b6, 0xebadfe6e, 0xeac31f66, 0xe3bc4595, 0xa67bc883, 0xb17f37d1, 0x018cff28,
                    0xc332ddef, 0xbe6c5aa5, 0x65582185, 0x68ab9802, 0xeecea50f, 0xdb2f953b, 0x2aef7dad, 0x5b6e2f84,
                    0x1521b628, 0x29076170, 0xecdd4775, 0x619f1510, 0x13cca830, 0xeb61bd96, 0x0334fe1e, 0xaa0363cf,
                    0xb5735c90, 0x4c70a239, 0xd59e9e0b, 0xcbaade14, 0xeecc86bc, 0x60622ca7, 0x9cab5cab, 0xb2f3846e,
                    0x648b1eaf, 0x19bdf0ca, 0xa02369b9, 0x655abb50, 0x40685a32, 0x3c2ab4b3, 0x319ee9d5, 0xc021b8f7,
                    0x9b540b19, 0x875fa099, 0x95f7997e, 0x623d7da8, 0xf837889a, 0x97e32d77, 0x11ed935f, 0x16681281,
                    0x0e358829, 0xc7e61fd6, 0x96dedfa1, 0x7858ba99, 0x57f584a5, 0x1b227263, 0x9b83c3ff, 0x1ac24696,
                    0xcdb30aeb, 0x532e3054, 0x8fd948e4, 0x6dbc3128, 0x58ebf2ef, 0x34c6ffea, 0xfe28ed61, 0xee7c3c73,
                    0x5d4a14d9, 0xe864b7e3, 0x42105d14, 0x203e13e0, 0x45eee2b6, 0xa3aaabea, 0xdb6c4f15, 0xfacb4fd0,
                    0xc742f442, 0xef6abbb5, 0x654f3b1d, 0x41cd2105, 0xd81e799e, 0x86854dc7, 0xe44b476a, 0x3d816250,
                    0xcf62a1f2, 0x5b8d2646, 0xfc8883a0, 0xc1c7b6a3, 0x7f1524c3, 0x69cb7492, 0x47848a0b, 0x5692b285,
                    0x095bbf00, 0xad19489d, 0x1462b174, 0x23820e00, 0x58428d2a, 0x0c55f5ea, 0x1dadf43e, 0x233f7061,
                    0x3372f092, 0x8d937e41, 0xd65fecf1, 0x6c223bdb, 0x7cde3759, 0xcbee7460, 0x4085f2a7, 0xce77326e,
                    0xa6078084, 0x19f8509e, 0xe8efd855, 0x61d99735, 0xa969a7aa, 0xc50c06c2, 0x5a04abfc, 0x800bcadc,
                    0x9e447a2e, 0xc3453484, 0xfdd56705, 0x0e1e9ec9, 0xdb73dbd3, 0x105588cd, 0x675fda79, 0xe3674340,
                    0xc5c43465, 0x713e38d8, 0x3d28f89e, 0xf16dff20, 0x153e21e7, 0x8fb03d4a, 0xe6e39f2b, 0xdb83adf7],

                   [0xe93d5a68, 0x948140f7, 0xf64c261c, 0x94692934, 0x411520f7, 0x7602d4f7, 0xbcf46b2e, 0xd4a20068,
                    0xd4082471, 0x3320f46a, 0x43b7d4b7, 0x500061af, 0x1e39f62e, 0x97244546, 0x14214f74, 0xbf8b8840,
                    0x4d95fc1d, 0x96b591af, 0x70f4ddd3, 0x66a02f45, 0xbfbc09ec, 0x03bd9785, 0x7fac6dd0, 0x31cb8504,
                    0x96eb27b3, 0x55fd3941, 0xda2547e6, 0xabca0a9a, 0x28507825, 0x530429f4, 0x0a2c86da, 0xe9b66dfb,
                    0x68dc1462, 0xd7486900, 0x680ec0a4, 0x27a18dee, 0x4f3ffea2, 0xe887ad8c, 0xb58ce006, 0x7af4d6b6,
                    0xaace1e7c, 0xd3375fec, 0xce78a399, 0x406b2a42, 0x20fe9e35, 0xd9f385b9, 0xee39d7ab, 0x3b124e8b,
                    0x1dc9faf7, 0x4b6d1856, 0x26a36631, 0xeae397b2, 0x3a6efa74, 0xdd5b4332, 0x6841e7f7, 0xca7820fb,
                    0xfb0af54e, 0xd8feb397, 0x454056ac, 0xba489527, 0x55533a3a, 0x20838d87, 0xfe6ba9b7, 0xd096954b,
                    0x55a867bc, 0xa1159a58, 0xcca92963, 0x99e1db33, 0xa62a4a56, 0x3f3125f9, 0x5ef47e1c, 0x9029317c,
                    0xfdf8e802, 0x04272f70, 0x80bb155c, 0x05282ce3, 0x95c11548, 0xe4c66d22, 0x48c1133f, 0xc70f86dc,
                    0x07f9c9ee, 0x41041f0f, 0x404779a4, 0x5d886e17, 0x325f51eb, 0xd59bc0d1, 0xf2bcc18f, 0x41113564,
                    0x257b7834, 0x602a9c60, 0xdff8e8a3, 0x1f636c1b, 0x0e12b4c2, 0x02e1329e, 0xaf664fd1, 0xcad18115,
                    0x6b2395e0, 0x333e92e1, 0x3b240b62, 0xeebeb922, 0x85b2a20e, 0xe6ba0d99, 0xde720c8c, 0x2da2f728,
                    0xd0127845, 0x95b794fd, 0x647d0862, 0xe7ccf5f0, 0x5449a36f, 0x877d48fa, 0xc39dfd27, 0xf33e8d1e,
                    0x0a476341, 0x992eff74, 0x3a6f6eab, 0xf4f8fd37, 0xa812dc60, 0xa1ebddf8, 0x991be14c, 0xdb6e6b0d,
                    0xc67b5510, 0x6d672c37, 0x2765d43b, 0xdcd0e804, 0xf1290dc7, 0xcc00ffa3, 0xb5390f92, 0x690fed0b,
                    0x667b9ffb, 0xcedb7d9c, 0xa091cf0b, 0xd9155ea3, 0xbb132f88, 0x515bad24, 0x7b9479bf, 0x763bd6eb,
                    0x37392eb3, 0xcc115979, 0x8026e297, 0xf42e312d, 0x6842ada7, 0xc66a2b3b, 0x12754ccc, 0x782ef11c,
                    0x6a124237, 0xb79251e7, 0x06a1bbe6, 0x4bfb6350, 0x1a6b1018, 0x11caedfa, 0x3d25bdd8, 0xe2e1c3c9,
                    0x44421659, 0x0a121386, 0xd90cec6e, 0xd5abea2a, 0x64af674e, 0xda86a85f, 0xbebfe988, 0x64e4c3fe,
                    0x9dbc8057, 0xf0f7c086, 0x60787bf8, 0x6003604d, 0xd1fd8346, 0xf6381fb0, 0x7745ae04, 0xd736fccc,
                    0x83426b33, 0xf01eab71, 0xb0804187, 0x3c005e5f, 0x77a057be, 0xbde8ae24, 0x55464299, 0xbf582e61,
                    0x4e58f48f, 0xf2ddfda2, 0xf474ef38, 0x8789bdc2, 0x5366f9c3, 0xc8b38e74, 0xb475f255, 0x46fcd9b9,
                    0x7aeb2661, 0x8b1ddf84, 0x846a0e79, 0x915f95e2, 0x466e598e, 0x20b45770, 0x8cd55591, 0xc902de4c,
                    0xb90bace1, 0xbb8205d0, 0x11a86248, 0x7574a99e, 0xb77f19b6, 0xe0a9dc09, 0x662d09a1, 0xc4324633,
                    0xe85a1f02, 0x09f0be8c, 0x4a99a025, 0x1d6efe10, 0x1ab93d1d, 0x0ba5a4df, 0xa186f20f, 0x2868f169,
                    0xdcb7da83, 0x573906fe, 0xa1e2ce9b, 0x4fcd7f52, 0x50115e01, 0xa70683fa, 0xa002b5c4, 0x0de6d027,
                    0x9af88c27, 0x773f8641, 0xc3604c06, 0x61a806b5, 0xf0177a28, 0xc0f586e0, 0x006058aa, 0x30dc7d62,
                    0x11e69ed7, 0x2338ea63, 0x53c2dd94, 0xc2c21634, 0xbbcbee56, 0x90bcb6de, 0xebfc7da1, 0xce591d76,
                    0x6f05e409, 0x4b7c0188, 0x39720a3d, 0x7c927c24, 0x86e3725f, 0x724d9db9, 0x1ac15bb4, 0xd39eb8fc,
                    0xed545578, 0x08fca5b5, 0xd83d7cd3, 0x4dad0fc4, 0x1e50ef5e, 0xb161e6f8, 0xa28514d9, 0x6c51133c,
                    0x6fd5c7e7, 0x56e14ec4, 0x362abfce, 0xddc6c837, 0xd79a3234, 0x92638212, 0x670efa8e, 0x406000e0],

                   [0x3a39ce37, 0xd3faf5cf, 0xabc27737, 0x5ac52d1b, 0x5cb0679e, 0x4fa33742, 0xd3822740, 0x99bc9bbe,
                    0xd5118e9d, 0xbf0f7315, 0xd62d1c7e, 0xc700c47b, 0xb78c1b6b, 0x21a19045, 0xb26eb1be, 0x6a366eb4,
                    0x5748ab2f, 0xbc946e79, 0xc6a376d2, 0x6549c2c8, 0x530ff8ee, 0x468dde7d, 0xd5730a1d, 0x4cd04dc6,
                    0x2939bbdb, 0xa9ba4650, 0xac9526e8, 0xbe5ee304, 0xa1fad5f0, 0x6a2d519a, 0x63ef8ce2, 0x9a86ee22,
                    0xc089c2b8, 0x43242ef6, 0xa51e03aa, 0x9cf2d0a4, 0x83c061ba, 0x9be96a4d, 0x8fe51550, 0xba645bd6,
                    0x2826a2f9, 0xa73a3ae1, 0x4ba99586, 0xef5562e9, 0xc72fefd3, 0xf752f7da, 0x3f046f69, 0x77fa0a59,
                    0x80e4a915, 0x87b08601, 0x9b09e6ad, 0x3b3ee593, 0xe990fd5a, 0x9e34d797, 0x2cf0b7d9, 0x022b8b51,
                    0x96d5ac3a, 0x017da67d, 0xd1cf3ed6, 0x7c7d2d28, 0x1f9f25cf, 0xadf2b89b, 0x5ad6b472, 0x5a88f54c,
                    0xe029ac71, 0xe019a5e6, 0x47b0acfd, 0xed93fa9b, 0xe8d3c48d, 0x283b57cc, 0xf8d56629, 0x79132e28,
                    0x785f0191, 0xed756055, 0xf7960e44, 0xe3d35e8c, 0x15056dd4, 0x88f46dba, 0x03a16125, 0x0564f0bd,
                    0xc3eb9e15, 0x3c9057a2, 0x97271aec, 0xa93a072a, 0x1b3f6d9b, 0x1e6321f5, 0xf59c66fb, 0x26dcf319,
                    0x7533d928, 0xb155fdf5, 0x03563482, 0x8aba3cbb, 0x28517711, 0xc20ad9f8, 0xabcc5167, 0xccad925f,
                    0x4de81751, 0x3830dc8e, 0x379d5862, 0x9320f991, 0xea7a90c2, 0xfb3e7bce, 0x5121ce64, 0x774fbe32,
                    0xa8b6e37e, 0xc3293d46, 0x48de5369, 0x6413e680, 0xa2ae0810, 0xdd6db224, 0x69852dfd, 0x09072166,
                    0xb39a460a, 0x6445c0dd, 0x586cdecf, 0x1c20c8ae, 0x5bbef7dd, 0x1b588d40, 0xccd2017f, 0x6bb4e3bb,
                    0xdda26a7e, 0x3a59ff45, 0x3e350a44, 0xbcb4cdd5, 0x72eacea8, 0xfa6484bb, 0x8d6612ae, 0xbf3c6f47,
                    0xd29be463, 0x542f5d9e, 0xaec2771b, 0xf64e6370, 0x740e0d8d, 0xe75b1357, 0xf8721671, 0xaf537d5d,
                    0x4040cb08, 0x4eb4e2cc, 0x34d2466a, 0x0115af84, 0xe1b00428, 0x95983a1d, 0x06b89fb4, 0xce6ea048,
                    0x6f3f3b82, 0x3520ab82, 0x011a1d4b, 0x277227f8, 0x611560b1, 0xe7933fdc, 0xbb3a792b, 0x344525bd,
                    0xa08839e1, 0x51ce794b, 0x2f32c9b7, 0xa01fbac9, 0xe01cc87e, 0xbcc7d1f6, 0xcf0111c3, 0xa1e8aac7,
                    0x1a908749, 0xd44fbd9a, 0xd0dadecb, 0xd50ada38, 0x0339c32a, 0xc6913667, 0x8df9317c, 0xe0b12b4f,
                    0xf79e59b7, 0x43f5bb3a, 0xf2d519ff, 0x27d9459c, 0xbf97222c, 0x15e6fc2a, 0x0f91fc71, 0x9b941525,
                    0xfae59361, 0xceb69ceb, 0xc2a86459, 0x12baa8d1, 0xb6c1075e, 0xe3056a0c, 0x10d25065, 0xcb03a442,
                    0xe0ec6e0e, 0x1698db3b, 0x4c98a0be, 0x3278e964, 0x9f1f9532, 0xe0d392df, 0xd3a0342b, 0x8971f21e,
                    0x1b0a7441, 0x4ba3348c, 0xc5be7120, 0xc37632d8, 0xdf359f8d, 0x9b992f2e, 0xe60b6f47, 0x0fe3f11d,
                    0xe54cda54, 0x1edad891, 0xce6279cf, 0xcd3e7e6f, 0x1618b166, 0xfd2c1d05, 0x848fd2c5, 0xf6fb2299,
                    0xf523f357, 0xa6327623, 0x93a83531, 0x56cccd02, 0xacf08162, 0x5a75ebb5, 0x6e163697, 0x88d273cc,
                    0xde966292, 0x81b949d0, 0x4c50901b, 0x71c65614, 0xe6c6c7bd, 0x327a140a, 0x45e1d006, 0xc3f27b9a,
                    0xc9aa53fd, 0x62a80f00, 0xbb25bfe2, 0x35bdd2f6, 0x71126905, 0xb2040222, 0xb6cbcf7c, 0xcd769c2b,
                    0x53113ec0, 0x1640e3d3, 0x38abbd60, 0x2547adf0, 0xba38209c, 0xf746ce76, 0x77afa1c5, 0x20756060,
                    0x85cbfe4e, 0x8ae88dd8, 0x7aaaf9b0, 0x4cf9aa7e, 0x1948c25c, 0x02fb8a8c, 0x01c36ae4, 0xd6ebe1f9,
                    0x90d4f869, 0xa65cdea0, 0x3f09252d, 0xc208e69f, 0xb74e6132, 0xce77e25b, 0x578fdfe3, 0x3ac372e6] ];

        var kl = ( k.length > 56 ? 56 : k.length );

        for( var i = 0, ki = 0; i < 18; i++ )
        {
            var d = 0, di = 4;
            while( di-- )
                d = ( d << 8 ) | k[ki++%kl];
            this.p[i] ^= d;
        }

        var l = 0, r = 0;

        for( var i = 0; i < 18; )
        {
            // begin rounds()
            var x = 16, t;
            var ri = -1, rd = 1;
            while( x-- )
            {
                l ^= this.p[ri += rd];
                r ^= ( ((this.s[0][(l >> 24) & 255] + this.s[1][(l >> 16) & 255]) ^ this.s[2][(l >> 8) & 255]) + this.s[3][l & 255] );
                t = r; r = l; l = t;
            }
            l = r ^ this.p[ri + rd + rd];
            r = t ^ this.p[ri + rd];
            // end rounds

            this.p[i++] = l;
            this.p[i++] = r;
        }

        for( var s = 0; s < 4; s++ )
        {
            for( i = 0; i < 256; )
            {
                // begin rounds()
                var x = 16, t;
                var ri = -1, rd = 1;
                while( x-- )
                {
                    l ^= this.p[ri += rd];
                    r ^= ( ((this.s[0][(l >> 24) & 255] + this.s[1][(l >> 16) & 255]) ^ this.s[2][(l >> 8) & 255]) + this.s[3][l & 255] );
                    t = r; r = l; l = t;
                }
                l = r ^ this.p[ri + rd + rd];
                r = t ^ this.p[ri + rd];
                // end rounds

                this.s[s][i++] = l;
                this.s[s][i++] = r;
            }
        }
    },

    encrypt: function(plaintext)
    {
        var cp = this.c.p;
        var cs0 = this.c.s[0];
        var cs1 = this.c.s[1];
        var cs2 = this.c.s[2];
        var cs3 = this.c.s[3];

        var n = plaintext.length & 7;
        while( n++ & 7 )
            plaintext += "\0";
        n = plaintext.length;

        var l = 0, r = 0;
        var tl = this.iv, tr = this.iv2;

        var ciphertext = "";

        for( var i = 0; i < n; i += 8 )
        {
            var s = -1, sa = 1;

            // begin fetch()
            l = ( plaintext.charCodeAt(i) << 24 ) | ( plaintext.charCodeAt(i+1) << 16 ) | ( plaintext.charCodeAt(i+2) << 8 ) | plaintext.charCodeAt(i+3);
            r = ( plaintext.charCodeAt(i+4) << 24 ) | ( plaintext.charCodeAt(i+5) << 16 ) | ( plaintext.charCodeAt(i+6) << 8 ) | plaintext.charCodeAt(i+7);
            // end fetch

            l ^= tl; r ^= tr;

            // begin rounds()
            var x = 16, t;
            while( x-- )
            {
                l ^= cp[s += sa];
                r ^= (((cs0[(l >> 24) & 255] + cs1[(l >> 16) & 255]) ^ cs2[(l >> 8) & 255]) + cs3[l & 255] );
                t = r; r = l; l = t;
            }
            l = r ^ cp[s + sa + sa];
            r = t ^ cp[s + sa];
            // end rounds

            tl = l; tr = r;

            ciphertext += String.fromCharCode(( l >> 24 ) & 255, ( l >> 16 ) & 255, ( l >> 8 ) & 255, l & 255,
                                              ( r >> 24 ) & 255, ( r >> 16 ) & 255, ( r >> 8 ) & 255, r & 255);
        }

        this.iv  = l;
        this.iv2 = r;
        return ciphertext;
    },

    decrypt: function(ciphertext)
    {
        var d = [];
        for (var x = 0; x < ciphertext.length; ++x) {
          d.push(ciphertext.charCodeAt(x));
        }
        var nextIv = d.slice(-8);
        var cp = this.c.p;
        var cs0 = this.c.s[0];
        var cs1 = this.c.s[1];
        var cs2 = this.c.s[2];
        var cs3 = this.c.s[3];
        var iv = this.iv;

        if( iv.length != 8 )
            iv = this.originalIv;              // this is b/c we optimize in the encrypt function

        var n = d.length & 7;
        while( n++ & 7 )
            d.push( 0 );
        n = d.length;

        var l = 0, r = 0;
        var tl = 0, tr = 0;
        var ol = 0, or = 0;

        // begin fetch()
        ol = ( iv[0] << 24 ) | ( iv[1] << 16 ) | ( iv[2] << 8 ) | iv[3];
        or = ( iv[4] << 24 ) | ( iv[5] << 16 ) | ( iv[6] << 8 ) | iv[7];
        // end fetch

        var plaintext = "";

        for( var i = 0; i < n; i += 8 )
        {
            var s = 18, sa = -1;

            // begin fetch()
            l = ( d[i] << 24 ) | ( d[i+1] << 16 ) | ( d[i+2] << 8 ) | d[i+3];
            r = ( d[i+4] << 24 ) | ( d[i+5] << 16 ) | ( d[i+6] << 8 ) | d[i+7];
            // end fetch

            tl = l; tr = r;

            // begin rounds()
            var x = 16, t;
            while( x-- )
            {
                l ^= cp[s += sa];
                r ^= ( ((cs0[(l >> 24) & 255] + cs1[(l >> 16) & 255]) ^ cs2[(l >> 8) & 255]) + cs3[l & 255] );
                t = r; r = l; l = t;
            }
            l = r ^ cp[s + sa + sa];
            r = t ^ cp[s + sa];
            // end rounds

            l ^= ol; r ^= or;

            ol = tl; or = tr;

            plaintext += String.fromCharCode(( l >> 24 ) & 255, ( l >> 16 ) & 255, ( l >> 8 ) & 255, l & 255,
                                             ( r >> 24 ) & 255, ( r >> 16 ) & 255, ( r >> 8 ) & 255, r & 255);
        }

        this.iv = nextIv;
        return plaintext;
    }

};

// Source: kryptos/Cipher/DES3.js
var DES3 = (function() {
//Paul Tero, July 2001
//http://www.tero.co.uk/des/
//
//Optimised for performance with large blocks by Michael Hayworth, November 2001
//http://www.netdealing.com
//
//THIS SOFTWARE IS PROVIDED "AS IS" AND
//ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
//IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
//ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
//FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
//DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
//OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
//HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
//LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
//OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
//SUCH DAMAGE.

//des
//this takes the key, the message, and whether to encrypt or decrypt
function des (key, message, encrypt, mode, iv, padding, keys) {
  //declaring this locally speeds things up a bit
  var spfunction1 = new Array (0x1010400,0,0x10000,0x1010404,0x1010004,0x10404,0x4,0x10000,0x400,0x1010400,0x1010404,0x400,0x1000404,0x1010004,0x1000000,0x4,0x404,0x1000400,0x1000400,0x10400,0x10400,0x1010000,0x1010000,0x1000404,0x10004,0x1000004,0x1000004,0x10004,0,0x404,0x10404,0x1000000,0x10000,0x1010404,0x4,0x1010000,0x1010400,0x1000000,0x1000000,0x400,0x1010004,0x10000,0x10400,0x1000004,0x400,0x4,0x1000404,0x10404,0x1010404,0x10004,0x1010000,0x1000404,0x1000004,0x404,0x10404,0x1010400,0x404,0x1000400,0x1000400,0,0x10004,0x10400,0,0x1010004);
  var spfunction2 = new Array (-0x7fef7fe0,-0x7fff8000,0x8000,0x108020,0x100000,0x20,-0x7fefffe0,-0x7fff7fe0,-0x7fffffe0,-0x7fef7fe0,-0x7fef8000,-0x80000000,-0x7fff8000,0x100000,0x20,-0x7fefffe0,0x108000,0x100020,-0x7fff7fe0,0,-0x80000000,0x8000,0x108020,-0x7ff00000,0x100020,-0x7fffffe0,0,0x108000,0x8020,-0x7fef8000,-0x7ff00000,0x8020,0,0x108020,-0x7fefffe0,0x100000,-0x7fff7fe0,-0x7ff00000,-0x7fef8000,0x8000,-0x7ff00000,-0x7fff8000,0x20,-0x7fef7fe0,0x108020,0x20,0x8000,-0x80000000,0x8020,-0x7fef8000,0x100000,-0x7fffffe0,0x100020,-0x7fff7fe0,-0x7fffffe0,0x100020,0x108000,0,-0x7fff8000,0x8020,-0x80000000,-0x7fefffe0,-0x7fef7fe0,0x108000);
  var spfunction3 = new Array (0x208,0x8020200,0,0x8020008,0x8000200,0,0x20208,0x8000200,0x20008,0x8000008,0x8000008,0x20000,0x8020208,0x20008,0x8020000,0x208,0x8000000,0x8,0x8020200,0x200,0x20200,0x8020000,0x8020008,0x20208,0x8000208,0x20200,0x20000,0x8000208,0x8,0x8020208,0x200,0x8000000,0x8020200,0x8000000,0x20008,0x208,0x20000,0x8020200,0x8000200,0,0x200,0x20008,0x8020208,0x8000200,0x8000008,0x200,0,0x8020008,0x8000208,0x20000,0x8000000,0x8020208,0x8,0x20208,0x20200,0x8000008,0x8020000,0x8000208,0x208,0x8020000,0x20208,0x8,0x8020008,0x20200);
  var spfunction4 = new Array (0x802001,0x2081,0x2081,0x80,0x802080,0x800081,0x800001,0x2001,0,0x802000,0x802000,0x802081,0x81,0,0x800080,0x800001,0x1,0x2000,0x800000,0x802001,0x80,0x800000,0x2001,0x2080,0x800081,0x1,0x2080,0x800080,0x2000,0x802080,0x802081,0x81,0x800080,0x800001,0x802000,0x802081,0x81,0,0,0x802000,0x2080,0x800080,0x800081,0x1,0x802001,0x2081,0x2081,0x80,0x802081,0x81,0x1,0x2000,0x800001,0x2001,0x802080,0x800081,0x2001,0x2080,0x800000,0x802001,0x80,0x800000,0x2000,0x802080);
  var spfunction5 = new Array (0x100,0x2080100,0x2080000,0x42000100,0x80000,0x100,0x40000000,0x2080000,0x40080100,0x80000,0x2000100,0x40080100,0x42000100,0x42080000,0x80100,0x40000000,0x2000000,0x40080000,0x40080000,0,0x40000100,0x42080100,0x42080100,0x2000100,0x42080000,0x40000100,0,0x42000000,0x2080100,0x2000000,0x42000000,0x80100,0x80000,0x42000100,0x100,0x2000000,0x40000000,0x2080000,0x42000100,0x40080100,0x2000100,0x40000000,0x42080000,0x2080100,0x40080100,0x100,0x2000000,0x42080000,0x42080100,0x80100,0x42000000,0x42080100,0x2080000,0,0x40080000,0x42000000,0x80100,0x2000100,0x40000100,0x80000,0,0x40080000,0x2080100,0x40000100);
  var spfunction6 = new Array (0x20000010,0x20400000,0x4000,0x20404010,0x20400000,0x10,0x20404010,0x400000,0x20004000,0x404010,0x400000,0x20000010,0x400010,0x20004000,0x20000000,0x4010,0,0x400010,0x20004010,0x4000,0x404000,0x20004010,0x10,0x20400010,0x20400010,0,0x404010,0x20404000,0x4010,0x404000,0x20404000,0x20000000,0x20004000,0x10,0x20400010,0x404000,0x20404010,0x400000,0x4010,0x20000010,0x400000,0x20004000,0x20000000,0x4010,0x20000010,0x20404010,0x404000,0x20400000,0x404010,0x20404000,0,0x20400010,0x10,0x4000,0x20400000,0x404010,0x4000,0x400010,0x20004010,0,0x20404000,0x20000000,0x400010,0x20004010);
  var spfunction7 = new Array (0x200000,0x4200002,0x4000802,0,0x800,0x4000802,0x200802,0x4200800,0x4200802,0x200000,0,0x4000002,0x2,0x4000000,0x4200002,0x802,0x4000800,0x200802,0x200002,0x4000800,0x4000002,0x4200000,0x4200800,0x200002,0x4200000,0x800,0x802,0x4200802,0x200800,0x2,0x4000000,0x200800,0x4000000,0x200800,0x200000,0x4000802,0x4000802,0x4200002,0x4200002,0x2,0x200002,0x4000000,0x4000800,0x200000,0x4200800,0x802,0x200802,0x4200800,0x802,0x4000002,0x4200802,0x4200000,0x200800,0,0x2,0x4200802,0,0x200802,0x4200000,0x800,0x4000002,0x4000800,0x800,0x200002);
  var spfunction8 = new Array (0x10001040,0x1000,0x40000,0x10041040,0x10000000,0x10001040,0x40,0x10000000,0x40040,0x10040000,0x10041040,0x41000,0x10041000,0x41040,0x1000,0x40,0x10040000,0x10000040,0x10001000,0x1040,0x41000,0x40040,0x10040040,0x10041000,0x1040,0,0,0x10040040,0x10000040,0x10001000,0x41040,0x40000,0x41040,0x40000,0x10041000,0x1000,0x40,0x10040040,0x1000,0x41040,0x10001000,0x40,0x10000040,0x10040000,0x10040040,0x10000000,0x40000,0x10001040,0,0x10041040,0x40040,0x10000040,0x10040000,0x10001000,0x10001040,0,0x10041040,0x41000,0x41000,0x1040,0x1040,0x40040,0x10000000,0x10041000);

  //create the 16 or 48 subkeys we will need
  var keys = keys || des_createKeys (key);
  var m=0, i, j, temp, temp2, right1, right2, left, right, looping;
  var cbcleft, cbcleft2, cbcright, cbcright2;
  var endloop, loopinc;
  var len = message.length;
  var chunk = 0;
  //set up the loops for single and triple des
  var iterations = keys.length == 32 ? 3 : 9; //single or triple des
  if (iterations == 3) {looping = encrypt ? new Array (0, 32, 2) : new Array (30, -2, -2);}
  else {looping = encrypt ? new Array (0, 32, 2, 62, 30, -2, 64, 96, 2) : new Array (94, 62, -2, 32, 64, 2, 30, -2, -2);}

  //pad the message depending on the padding parameter
  if (padding == 2) message += "        "; //pad the message with spaces
  else if (padding == 1) {temp = 8-(len%8); message += String.fromCharCode (temp,temp,temp,temp,temp,temp,temp,temp); if (temp==8) len+=8;} //PKCS7 padding
  else if (!padding) message += "\0\0\0\0\0\0\0\0"; //pad the message out with null bytes

  //store the result here
  var result = "";
  var tempresult = "";

  if (mode == 1) { //CBC mode
    cbcleft = (iv.charCodeAt(m++) << 24) | (iv.charCodeAt(m++) << 16) | (iv.charCodeAt(m++) << 8) | iv.charCodeAt(m++);
    cbcright = (iv.charCodeAt(m++) << 24) | (iv.charCodeAt(m++) << 16) | (iv.charCodeAt(m++) << 8) | iv.charCodeAt(m++);
    m=0;
  }

  //loop through each 64 bit chunk of the message
  while (m < len) {
    left = (message.charCodeAt(m++) << 24) | (message.charCodeAt(m++) << 16) | (message.charCodeAt(m++) << 8) | message.charCodeAt(m++);
    right = (message.charCodeAt(m++) << 24) | (message.charCodeAt(m++) << 16) | (message.charCodeAt(m++) << 8) | message.charCodeAt(m++);

    //for Cipher Block Chaining mode, xor the message with the previous result
    if (mode == 1) {if (encrypt) {left ^= cbcleft; right ^= cbcright;} else {cbcleft2 = cbcleft; cbcright2 = cbcright; cbcleft = left; cbcright = right;}}

    //first each 64 but chunk of the message must be permuted according to IP
    temp = ((left >>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);
    temp = ((left >>> 16) ^ right) & 0x0000ffff; right ^= temp; left ^= (temp << 16);
    temp = ((right >>> 2) ^ left) & 0x33333333; left ^= temp; right ^= (temp << 2);
    temp = ((right >>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
    temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);

    left = ((left << 1) | (left >>> 31));
    right = ((right << 1) | (right >>> 31));

    //do this either 1 or 3 times for each chunk of the message
    for (j=0; j<iterations; j+=3) {
      endloop = looping[j+1];
      loopinc = looping[j+2];
      //now go through and perform the encryption or decryption
      for (i=looping[j]; i!=endloop; i+=loopinc) { //for efficiency
        right1 = right ^ keys[i];
        right2 = ((right >>> 4) | (right << 28)) ^ keys[i+1];
        //the result is attained by passing these bytes through the S selection functions
        temp = left;
        left = right;
        right = temp ^ (spfunction2[(right1 >>> 24) & 0x3f] | spfunction4[(right1 >>> 16) & 0x3f]
              | spfunction6[(right1 >>>  8) & 0x3f] | spfunction8[right1 & 0x3f]
              | spfunction1[(right2 >>> 24) & 0x3f] | spfunction3[(right2 >>> 16) & 0x3f]
              | spfunction5[(right2 >>>  8) & 0x3f] | spfunction7[right2 & 0x3f]);
      }
      temp = left; left = right; right = temp; //unreverse left and right
    } //for either 1 or 3 iterations

    //move then each one bit to the right
    left = ((left >>> 1) | (left << 31));
    right = ((right >>> 1) | (right << 31));

    //now perform IP-1, which is IP in the opposite direction
    temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);
    temp = ((right >>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
    temp = ((right >>> 2) ^ left) & 0x33333333; left ^= temp; right ^= (temp << 2);
    temp = ((left >>> 16) ^ right) & 0x0000ffff; right ^= temp; left ^= (temp << 16);
    temp = ((left >>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);

    //for Cipher Block Chaining mode, xor the message with the previous result
    if (mode == 1) {if (encrypt) {cbcleft = left; cbcright = right;} else {left ^= cbcleft2; right ^= cbcright2;}}
    tempresult += String.fromCharCode ((left>>>24), ((left>>>16) & 0xff), ((left>>>8) & 0xff), (left & 0xff), (right>>>24), ((right>>>16) & 0xff), ((right>>>8) & 0xff), (right & 0xff));

    chunk += 8;
    if (chunk == 512) {result += tempresult; tempresult = ""; chunk = 0;}
  } //for every 8 characters, or 64 bits in the message

  //return the result as an array
  return result + tempresult;
} //end of des



//des_createKeys
//this takes as input a 64 bit key (even though only 56 bits are used)
//as an array of 2 integers, and returns 16 48 bit keys
function des_createKeys (key) {
  //declaring this locally speeds things up a bit
  var pc2bytes0  = new Array (0,0x4,0x20000000,0x20000004,0x10000,0x10004,0x20010000,0x20010004,0x200,0x204,0x20000200,0x20000204,0x10200,0x10204,0x20010200,0x20010204);
  var pc2bytes1  = new Array (0,0x1,0x100000,0x100001,0x4000000,0x4000001,0x4100000,0x4100001,0x100,0x101,0x100100,0x100101,0x4000100,0x4000101,0x4100100,0x4100101);
  var pc2bytes2  = new Array (0,0x8,0x800,0x808,0x1000000,0x1000008,0x1000800,0x1000808,0,0x8,0x800,0x808,0x1000000,0x1000008,0x1000800,0x1000808);
  var pc2bytes3  = new Array (0,0x200000,0x8000000,0x8200000,0x2000,0x202000,0x8002000,0x8202000,0x20000,0x220000,0x8020000,0x8220000,0x22000,0x222000,0x8022000,0x8222000);
  var pc2bytes4  = new Array (0,0x40000,0x10,0x40010,0,0x40000,0x10,0x40010,0x1000,0x41000,0x1010,0x41010,0x1000,0x41000,0x1010,0x41010);
  var pc2bytes5  = new Array (0,0x400,0x20,0x420,0,0x400,0x20,0x420,0x2000000,0x2000400,0x2000020,0x2000420,0x2000000,0x2000400,0x2000020,0x2000420);
  var pc2bytes6  = new Array (0,0x10000000,0x80000,0x10080000,0x2,0x10000002,0x80002,0x10080002,0,0x10000000,0x80000,0x10080000,0x2,0x10000002,0x80002,0x10080002);
  var pc2bytes7  = new Array (0,0x10000,0x800,0x10800,0x20000000,0x20010000,0x20000800,0x20010800,0x20000,0x30000,0x20800,0x30800,0x20020000,0x20030000,0x20020800,0x20030800);
  var pc2bytes8  = new Array (0,0x40000,0,0x40000,0x2,0x40002,0x2,0x40002,0x2000000,0x2040000,0x2000000,0x2040000,0x2000002,0x2040002,0x2000002,0x2040002);
  var pc2bytes9  = new Array (0,0x10000000,0x8,0x10000008,0,0x10000000,0x8,0x10000008,0x400,0x10000400,0x408,0x10000408,0x400,0x10000400,0x408,0x10000408);
  var pc2bytes10 = new Array (0,0x20,0,0x20,0x100000,0x100020,0x100000,0x100020,0x2000,0x2020,0x2000,0x2020,0x102000,0x102020,0x102000,0x102020);
  var pc2bytes11 = new Array (0,0x1000000,0x200,0x1000200,0x200000,0x1200000,0x200200,0x1200200,0x4000000,0x5000000,0x4000200,0x5000200,0x4200000,0x5200000,0x4200200,0x5200200);
  var pc2bytes12 = new Array (0,0x1000,0x8000000,0x8001000,0x80000,0x81000,0x8080000,0x8081000,0x10,0x1010,0x8000010,0x8001010,0x80010,0x81010,0x8080010,0x8081010);
  var pc2bytes13 = new Array (0,0x4,0x100,0x104,0,0x4,0x100,0x104,0x1,0x5,0x101,0x105,0x1,0x5,0x101,0x105);

  //how many iterations (1 for des, 3 for triple des)
  var iterations = key.length > 8 ? 3 : 1; //changed by Paul 16/6/2007 to use Triple DES for 9+ byte keys
  //stores the return keys
  var keys = new Array (32 * iterations);
  //now define the left shifts which need to be done
  var shifts = new Array (0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0);
  //other variables
  var lefttemp, righttemp, m=0, n=0, temp, left, right;

  for (var j=0; j<iterations; j++) { //either 1 or 3 iterations
    left = (key.charCodeAt(m++) << 24) | (key.charCodeAt(m++) << 16) | (key.charCodeAt(m++) << 8) | key.charCodeAt(m++);
    right = (key.charCodeAt(m++) << 24) | (key.charCodeAt(m++) << 16) | (key.charCodeAt(m++) << 8) | key.charCodeAt(m++);

    temp = ((left >>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);
    temp = ((right >>> -16) ^ left) & 0x0000ffff; left ^= temp; right ^= (temp << -16);
    temp = ((left >>> 2) ^ right) & 0x33333333; right ^= temp; left ^= (temp << 2);
    temp = ((right >>> -16) ^ left) & 0x0000ffff; left ^= temp; right ^= (temp << -16);
    temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);
    temp = ((right >>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
    temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);

    //the right side needs to be shifted and to get the last four bits of the left side
    temp = (left << 8) | ((right >>> 20) & 0x000000f0);
    //left needs to be put upside down
    left = (right << 24) | ((right << 8) & 0xff0000) | ((right >>> 8) & 0xff00) | ((right >>> 24) & 0xf0);
    right = temp;

    //now go through and perform these shifts on the left and right keys
    for (var i=0; i < shifts.length; i++) {
      //shift the keys either one or two bits to the left
      if (shifts[i]) {left = (left << 2) | (left >>> 26); right = (right << 2) | (right >>> 26);}
      else {left = (left << 1) | (left >>> 27); right = (right << 1) | (right >>> 27);}
      left &= -0xf; right &= -0xf;

      //now apply PC-2, in such a way that E is easier when encrypting or decrypting
      //this conversion will look like PC-2 except only the last 6 bits of each byte are used
      //rather than 48 consecutive bits and the order of lines will be according to
      //how the S selection functions will be applied: S2, S4, S6, S8, S1, S3, S5, S7
      lefttemp = pc2bytes0[left >>> 28] | pc2bytes1[(left >>> 24) & 0xf]
              | pc2bytes2[(left >>> 20) & 0xf] | pc2bytes3[(left >>> 16) & 0xf]
              | pc2bytes4[(left >>> 12) & 0xf] | pc2bytes5[(left >>> 8) & 0xf]
              | pc2bytes6[(left >>> 4) & 0xf];
      righttemp = pc2bytes7[right >>> 28] | pc2bytes8[(right >>> 24) & 0xf]
                | pc2bytes9[(right >>> 20) & 0xf] | pc2bytes10[(right >>> 16) & 0xf]
                | pc2bytes11[(right >>> 12) & 0xf] | pc2bytes12[(right >>> 8) & 0xf]
                | pc2bytes13[(right >>> 4) & 0xf];
      temp = ((righttemp >>> 16) ^ lefttemp) & 0x0000ffff;
      keys[n++] = lefttemp ^ temp; keys[n++] = righttemp ^ (temp << 16);
    }
  } //for each iterations
  //return the keys we've created
  return keys;
} //end of des_createKeys

return {
  des : des,
  des_createKeys : des_createKeys
};

})();

kryptos.cipher.DES3 = function(key, mode, iv) {
  this.keys = DES3.des_createKeys(key);
  this.mode = mode == kryptos.cipher.DES3.MODE_CBC ? 1 : 0;
  this.iv = iv;
};

kryptos.cipher.DES3.MODE_CBC = 2;

kryptos.cipher.DES3.prototype = {
  encrypt : function(plaintext) {
    var ciphertext = DES3.des(null, plaintext, true, this.mode, this.iv, null, this.keys);
    this.iv = ciphertext.substring(ciphertext.length - 8);
    return ciphertext;
  },

  decrypt : function(ciphertext) {
    var plaintext = DES3.des(null, ciphertext, false, this.mode, this.iv, null, this.keys);
    this.iv = ciphertext.substring(ciphertext.length - 8);
    return plaintext;
  }
};

// Source: kryptos/Cipher/ARC4.js
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview ARC4 streamcipher implementation.  A description of the
 * algorithm can be found at:
 * http://www.mozilla.org/projects/security/pki/nss/draft-kaukonen-cipher-arcfour-03.txt.
 *
 * Usage:
 * <code>
 *   var arc4 = new goog.crypt.Arc4();
 *   arc4.setKey(key);
 *   arc4.discard(1536);
 *   arc4.crypt(bytes);
 * </code>
 *
 * Note: For converting between strings and byte arrays, goog.crypt.base64 may
 * be useful.
 *
 */

goog = {};
goog.crypt = {};


/**
 * ARC4 streamcipher implementation.
 * @constructor
 */
goog.crypt.Arc4 = function() {
  /**
   * A permutation of all 256 possible bytes.
   * @type {Array.<number>}
   * @private
   */
  this.state_ = [];

  /**
   * 8 bit index pointer into this.state_.
   * @type {number}
   * @private
   */
  this.index1_ = 0;

  /**
   * 8 bit index pointer into this.state_.
   * @type {number}
   * @private
   */
  this.index2_ = 0;
};


/**
 * Initialize the cipher for use with new key.
 * @param {Array.<number>} key A byte array containing the key.
 * @param {number=} opt_length Indicates # of bytes to take from the key.
 */
goog.crypt.Arc4.prototype.setKey = function(key, opt_length) {
  if (!opt_length) {
    opt_length = key.length;
  }

  var state = this.state_;

  for (var i = 0; i < 256; ++i) {
    state[i] = i;
  }

  var j = 0;
  for (var i = 0; i < 256; ++i) {
    j = (j + state[i] + key[i % opt_length]) & 255;

    var tmp = state[i];
    state[i] = state[j];
    state[j] = tmp;
  }

  this.index1_ = 0;
  this.index2_ = 0;
};


/**
 * Discards n bytes of the keystream.
 * These days 1536 is considered a decent amount to drop to get the key state
 * warmed-up enough for secure usage. This is not done in the constructor to
 * preserve efficiency for use cases that do not need this.
 * @param {number} n Number of bytes to disregard from the stream.
 */
goog.crypt.Arc4.prototype.discard = function(n) {
  var devnul = new Array(n);
  this.crypt(devnul);
};


/**
 * En- or decrypt (same operation for streamciphers like ARC4)
 * @param {Array.<number>} data The data to be xor-ed in place.
 * @param {number=} opt_length The number of bytes to crypt.
 */
goog.crypt.Arc4.prototype.crypt = function(data, opt_length) {
  if (!opt_length) {
    opt_length = data.length;
  }

  var i = this.index1_;
  var j = this.index2_;
  var state = this.state_;

  for (var n = 0; n < opt_length; ++n) {
    i = (i + 1) & 255;
    j = (j + state[i]) & 255;

    var tmp = state[i];
    state[i] = state[j];
    state[j] = tmp;

    data[n] ^= state[(state[i] + state[j]) & 255];
  }

  this.index1_ = i;
  this.index2_ = j;
};


kryptos.cipher.ARC4 = function(key) {
  this.cipher = new goog.crypt.Arc4();
  this.cipher.setKey(kryptos.toByteArray(key));
};

kryptos.cipher.ARC4.prototype = {
  encrypt : function(data) {
    var data = kryptos.toByteArray(data);
    this.cipher.crypt(data);
    return kryptos.fromByteArray(data);
  },

  decrypt : function(data) {
    return this.encrypt(data);
  }
};

// Source: kryptos/Hash/baseHash.js
kryptos.hash.baseHash = function(data) {
  if (data instanceof Array) {
    data = kryptos.fromByteArray(data);
  }
  this.data = data || "";
};

kryptos.hash.baseHash.prototype = {
  type : '',

  update : function(data) {
    if (data instanceof Array) {
      data = kryptos.fromByteArray(data);
    }
    this.data = this.data + data;
  },

  digest : function() {
    var hashData = [];
    for (var x = 0; x < this.data.length; ++x) {
      hashData.push(this.data.charCodeAt(x));
    }

    if(!(window.Components && window.Components.classes)) {
      throw new Error("Unable to use " + this.type + " hash without Mozilla's Components.classes"); //FIXME
    }
    var hashComp = window.Components.classes["@mozilla.org/security/hash;1"].createInstance(window.Components.interfaces.nsICryptoHash);
    hashComp.initWithString(this.type);
    hashComp.update(hashData, hashData.length);
    var result = hashComp.finish(false);

    return result;
  }
};

// Source: kryptos/Hash/SHA.js
kryptos.hash.SHA = function(str) {
  inherit(this, new kryptos.hash.baseHash(str));
};

kryptos.hash.SHA.digest_size = 20;

kryptos.hash.SHA.prototype = {
  type : 'sha1'
};

// http://code.google.com/p/crypto-js/source/browse/branches/2.x/src/SHA1.js
// BSD license: http://www.opensource.org/licenses/bsd-license.php
//if (!(window.Components  && window.Components.classes))
{  // Chrome
  kryptos.hash.SHA.prototype = {
    digest: function() {
      var hashData = kryptos.toByteArray(this.data);

      var m  = kryptos.bytesToWords(hashData),
          l  = hashData.length * 8,
          w  =  [],
          H0 =  1732584193,
          H1 = -271733879,
          H2 = -1732584194,
          H3 =  271733878,
          H4 = -1009589776;

      // Padding
      m[l >> 5] |= 0x80 << (24 - l % 32);
      m[((l + 64 >>> 9) << 4) + 15] = l;

      for (var i = 0; i < m.length; i += 16) {
        var a = H0,
            b = H1,
            c = H2,
            d = H3,
            e = H4;

        for (var j = 0; j < 80; j++) {
          if (j < 16) {
            w[j] = m[i + j];
          } else {
            var n = w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16];
            w[j] = (n << 1) | (n >>> 31);
          }

          var t = ((H0 << 5) | (H0 >>> 27)) + H4 + (w[j] >>> 0) + (
                   j < 20 ? (H1 & H2 | ~H1 & H3) + 1518500249 :
                   j < 40 ? (H1 ^ H2 ^ H3) + 1859775393 :
                   j < 60 ? (H1 & H2 | H1 & H3 | H2 & H3) - 1894007588 :
                            (H1 ^ H2 ^ H3) - 899497514);

          H4 =  H3;
          H3 =  H2;
          H2 = (H1 << 30) | (H1 >>> 2);
          H1 =  H0;
          H0 =  t;
        }

        H0 += a;
        H1 += b;
        H2 += c;
        H3 += d;
        H4 += e;
      }

      return kryptos.fromByteArray(kryptos.wordsToBytes([H0, H1, H2, H3, H4]));
    }
  };
}

// Source: kryptos/Hash/SHA256.js
kryptos.hash.SHA256 = function(str) {
  inherit(this, new kryptos.hash.baseHash(str));
};

kryptos.hash.SHA256.digest_size = 32;

kryptos.hash.SHA256.prototype = {
  type : 'sha256'
};

// http://code.google.com/p/crypto-js/source/browse/branches/2.x/src/SHA256.js
// BSD license: http://www.opensource.org/licenses/bsd-license.php
//if (!(window.Components && window.Components.classes))
{  // Chrome
  kryptos.hash.SHA256.prototype = {
    digest: function() {
      var hashData = kryptos.toByteArray(this.data);

      // Constants
      var K = [ 0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
          0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
          0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
          0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
          0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
          0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
          0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
          0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
          0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
          0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
          0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
          0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
          0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
          0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
          0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
          0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2 ];

      var m = kryptos.bytesToWords(hashData),
          l = hashData.length * 8,
          H = [ 0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A,
                0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19 ],
          w = [],
          a, b, c, d, e, f, g, h, i, j,
          t1, t2;

      // Padding
      m[l >> 5] |= 0x80 << (24 - l % 32);
      m[((l + 64 >> 9) << 4) + 15] = l;

      for (var i = 0; i < m.length; i += 16) {
        a = H[0];
        b = H[1];
        c = H[2];
        d = H[3];
        e = H[4];
        f = H[5];
        g = H[6];
        h = H[7];

        for (var j = 0; j < 64; j++) {
          if (j < 16) {
            w[j] = m[j + i];
          } else {
            var gamma0x = w[j - 15],
                gamma1x = w[j - 2],
                gamma0  = ((gamma0x << 25) | (gamma0x >>>  7)) ^
                          ((gamma0x << 14) | (gamma0x >>> 18)) ^
                           (gamma0x >>> 3),
                gamma1  = ((gamma1x <<  15) | (gamma1x >>> 17)) ^
                          ((gamma1x <<  13) | (gamma1x >>> 19)) ^
                           (gamma1x >>> 10);

            w[j] = gamma0 + (w[j - 7] >>> 0) +
                   gamma1 + (w[j - 16] >>> 0);
          }

          var ch  = e & f ^ ~e & g,
              maj = a & b ^ a & c ^ b & c,
              sigma0 = ((a << 30) | (a >>>  2)) ^
                       ((a << 19) | (a >>> 13)) ^
                       ((a << 10) | (a >>> 22)),
              sigma1 = ((e << 26) | (e >>>  6)) ^
                       ((e << 21) | (e >>> 11)) ^
                       ((e <<  7) | (e >>> 25));

          t1 = (h >>> 0) + sigma1 + ch + (K[j]) + (w[j] >>> 0);
          t2 = sigma0 + maj;

          h = g;
          g = f;
          f = e;
          e = (d + t1) >>> 0;
          d = c;
          c = b;
          b = a;
          a = (t1 + t2) >>> 0;
        }

        H[0] += a;
        H[1] += b;
        H[2] += c;
        H[3] += d;
        H[4] += e;
        H[5] += f;
        H[6] += g;
        H[7] += h;
      }

      return kryptos.fromByteArray(kryptos.wordsToBytes(H));
    }
  };
}

// Source: kryptos/Hash/MD5.js
kryptos.hash.MD5 = function(str) {
  inherit(this, new kryptos.hash.baseHash(str));
};

kryptos.hash.MD5.digest_size = 16;

kryptos.hash.MD5.prototype = {
  type : 'md5'
};

// http://code.google.com/p/crypto-js/source/browse/branches/2.x/src/MD5.js
// BSD license: http://www.opensource.org/licenses/bsd-license.php
//if (!(window.Components && window.Components.classes))
{  // Chrome
  kryptos.hash.MD5.prototype = {
    digest: function() {
      var hashData = kryptos.toByteArray(this.data);

      var m = kryptos.bytesToWords(hashData),
          l = hashData.length * 8,
          a =  1732584193,
          b = -271733879,
          c = -1732584194,
          d =  271733878;

      // Swap endian
      for (var i = 0; i < m.length; i++) {
          m[i] = ((m[i] <<  8) | (m[i] >>> 24)) & 0x00FF00FF |
                 ((m[i] << 24) | (m[i] >>>  8)) & 0xFF00FF00;
      }

      // Padding
      m[l >>> 5] |= 0x80 << (l % 32);
      m[(((l + 64) >>> 9) << 4) + 14] = l;

      // Method shortcuts
      var FF = function (a, b, c, d, x, s, t) {
        var n = a + (b & c | ~b & d) + (x >>> 0) + t;
        return ((n << s) | (n >>> (32 - s))) + b;
      };
      var GG = function (a, b, c, d, x, s, t) {
        var n = a + (b & d | c & ~d) + (x >>> 0) + t;
        return ((n << s) | (n >>> (32 - s))) + b;
      };
      var HH = function (a, b, c, d, x, s, t) {
        var n = a + (b ^ c ^ d) + (x >>> 0) + t;
        return ((n << s) | (n >>> (32 - s))) + b;
      };
      var II = function (a, b, c, d, x, s, t) {
        var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
        return ((n << s) | (n >>> (32 - s))) + b;
      };

      for (var i = 0; i < m.length; i += 16) {
        var aa = a,
            bb = b,
            cc = c,
            dd = d;

        a = FF(a, b, c, d, m[i+ 0],  7, -680876936);
        d = FF(d, a, b, c, m[i+ 1], 12, -389564586);
        c = FF(c, d, a, b, m[i+ 2], 17,  606105819);
        b = FF(b, c, d, a, m[i+ 3], 22, -1044525330);
        a = FF(a, b, c, d, m[i+ 4],  7, -176418897);
        d = FF(d, a, b, c, m[i+ 5], 12,  1200080426);
        c = FF(c, d, a, b, m[i+ 6], 17, -1473231341);
        b = FF(b, c, d, a, m[i+ 7], 22, -45705983);
        a = FF(a, b, c, d, m[i+ 8],  7,  1770035416);
        d = FF(d, a, b, c, m[i+ 9], 12, -1958414417);
        c = FF(c, d, a, b, m[i+10], 17, -42063);
        b = FF(b, c, d, a, m[i+11], 22, -1990404162);
        a = FF(a, b, c, d, m[i+12],  7,  1804603682);
        d = FF(d, a, b, c, m[i+13], 12, -40341101);
        c = FF(c, d, a, b, m[i+14], 17, -1502002290);
        b = FF(b, c, d, a, m[i+15], 22,  1236535329);

        a = GG(a, b, c, d, m[i+ 1],  5, -165796510);
        d = GG(d, a, b, c, m[i+ 6],  9, -1069501632);
        c = GG(c, d, a, b, m[i+11], 14,  643717713);
        b = GG(b, c, d, a, m[i+ 0], 20, -373897302);
        a = GG(a, b, c, d, m[i+ 5],  5, -701558691);
        d = GG(d, a, b, c, m[i+10],  9,  38016083);
        c = GG(c, d, a, b, m[i+15], 14, -660478335);
        b = GG(b, c, d, a, m[i+ 4], 20, -405537848);
        a = GG(a, b, c, d, m[i+ 9],  5,  568446438);
        d = GG(d, a, b, c, m[i+14],  9, -1019803690);
        c = GG(c, d, a, b, m[i+ 3], 14, -187363961);
        b = GG(b, c, d, a, m[i+ 8], 20,  1163531501);
        a = GG(a, b, c, d, m[i+13],  5, -1444681467);
        d = GG(d, a, b, c, m[i+ 2],  9, -51403784);
        c = GG(c, d, a, b, m[i+ 7], 14,  1735328473);
        b = GG(b, c, d, a, m[i+12], 20, -1926607734);

        a = HH(a, b, c, d, m[i+ 5],  4, -378558);
        d = HH(d, a, b, c, m[i+ 8], 11, -2022574463);
        c = HH(c, d, a, b, m[i+11], 16,  1839030562);
        b = HH(b, c, d, a, m[i+14], 23, -35309556);
        a = HH(a, b, c, d, m[i+ 1],  4, -1530992060);
        d = HH(d, a, b, c, m[i+ 4], 11,  1272893353);
        c = HH(c, d, a, b, m[i+ 7], 16, -155497632);
        b = HH(b, c, d, a, m[i+10], 23, -1094730640);
        a = HH(a, b, c, d, m[i+13],  4,  681279174);
        d = HH(d, a, b, c, m[i+ 0], 11, -358537222);
        c = HH(c, d, a, b, m[i+ 3], 16, -722521979);
        b = HH(b, c, d, a, m[i+ 6], 23,  76029189);
        a = HH(a, b, c, d, m[i+ 9],  4, -640364487);
        d = HH(d, a, b, c, m[i+12], 11, -421815835);
        c = HH(c, d, a, b, m[i+15], 16,  530742520);
        b = HH(b, c, d, a, m[i+ 2], 23, -995338651);

        a = II(a, b, c, d, m[i+ 0],  6, -198630844);
        d = II(d, a, b, c, m[i+ 7], 10,  1126891415);
        c = II(c, d, a, b, m[i+14], 15, -1416354905);
        b = II(b, c, d, a, m[i+ 5], 21, -57434055);
        a = II(a, b, c, d, m[i+12],  6,  1700485571);
        d = II(d, a, b, c, m[i+ 3], 10, -1894986606);
        c = II(c, d, a, b, m[i+10], 15, -1051523);
        b = II(b, c, d, a, m[i+ 1], 21, -2054922799);
        a = II(a, b, c, d, m[i+ 8],  6,  1873313359);
        d = II(d, a, b, c, m[i+15], 10, -30611744);
        c = II(c, d, a, b, m[i+ 6], 15, -1560198380);
        b = II(b, c, d, a, m[i+13], 21,  1309151649);
        a = II(a, b, c, d, m[i+ 4],  6, -145523070);
        d = II(d, a, b, c, m[i+11], 10, -1120210379);
        c = II(c, d, a, b, m[i+ 2], 15,  718787259);
        b = II(b, c, d, a, m[i+ 9], 21, -343485551);

        a = (a + aa) >>> 0;
        b = (b + bb) >>> 0;
        c = (c + cc) >>> 0;
        d = (d + dd) >>> 0;
      }

      var rotl = function (n, b) {
        return (n << b) | (n >>> (32 - b));
      };

      var endian = function (n) {
        // If number given, swap endian
        if (n.constructor == Number) {
          return rotl(n,  8) & 0x00FF00FF |
                 rotl(n, 24) & 0xFF00FF00;
        }

        // Else, assume array and swap all items
        for (var i = 0; i < n.length; i++) {
          n[i] = endian(n[i]);
        }
        return n;
      };

      return kryptos.fromByteArray(kryptos.wordsToBytes(endian([a, b, c, d])));
    }
  };
}

// Source: kryptos/Hash/HMAC.js
/*if (window.Components && window.Components.classes) { // Mozilla extension
  kryptos.hash.HMAC = function(key, msg, digestmod) {
    var hasher = window.Components.classes["@mozilla.org/security/hmac;1"].createInstance(window.Components.interfaces.nsICryptoHMAC);
    var keyObject = window.Components.classes["@mozilla.org/security/keyobjectfactory;1"]
                      .getService(window.Components.interfaces.nsIKeyObjectFactory)
                      .keyFromString(window.Components.interfaces.nsIKeyObject.HMAC, key);

    hasher.init(digestmod, keyObject);
    var data = kryptos.toByteArray(msg);
    hasher.update(data, data.length);
    return hasher.finish(false);
  };

  kryptos.hash.HMAC_SHA = window.Components.classes["@mozilla.org/security/hmac;1"].createInstance(window.Components.interfaces.nsICryptoHMAC).SHA1;
  kryptos.hash.HMAC_MD5 = window.Components.classes["@mozilla.org/security/hmac;1"].createInstance(window.Components.interfaces.nsICryptoHMAC).MD5;
} else */
{  // Chrome
  kryptos.hash.HMAC = function(key, msg, digestmod) {
    var blocksize = 64;
    var ipad = 0x36;
    var opad = 0x5C;

    var hasher = digestmod == 3 ? kryptos.hash.SHA : kryptos.hash.MD5;

    var outer = new hasher();
    var inner = new hasher();

    if (key.length > blocksize) {
      key = new hasher(key).digest();
    }

    key = key + new Array(blocksize - key.length + 1).join('\x00');

    var okey = kryptos.toByteArray(key).slice(0);
    var ikey = kryptos.toByteArray(key).slice(0);

    for (var x = 0; x < blocksize; ++x) {
      okey[x] ^= opad;
      ikey[x] ^= ipad;
    }

    outer.update(okey);
    inner.update(ikey);
    inner.update(msg);
    outer.update(inner.digest());
    return outer.digest();
  };
  kryptos.hash.HMAC_SHA = 3;
  kryptos.hash.HMAC_MD5 = 2;
}

// Source: kryptos/PublicKey/RSA.js
kryptos.publicKey.RSA = function() {

};

kryptos.publicKey.RSA.prototype = {
  construct : function(n, e, d) {
    this.n = n;
    this.e = e;
    this.d = d;

    return this;
  },

  sign : function(m, K) {
    return [m.modPow(this.d, this.n), ''];
  },

  verify : function(m, sig) {
    var s = sig[0];  // HACK - We should use the previous line instead, but
                     // this is more compatible and we're going to replace
                     // the Crypto.PublicKey API soon anyway.
    return s.modPow(this.e, this.n).equals(m);
  },

  generate : function() {
    alert('NOT_IMPLEMENTED');
  }
};

// Source: kryptos/PublicKey/DSA.js
kryptos.publicKey.DSA = function() {

};

kryptos.publicKey.DSA.prototype = {
  construct : function(y, g, p, q, x) {
    this.y = y;
    this.g = g;
    this.p = p;
    this.q = q;
    this.x = x;

    return this;
  },

  sign : function(m, k) {
    // SECURITY TODO - We _should_ be computing SHA1(m), but we don't because that's the API.
    var one = BigInteger.ONE;
    if (!(k.compareTo(one) > 0 && this.q.compareTo(k) > 0)) {
      throw "k is not between 2 and q-1";
    }
    var inv_k = k.modInverse(this.q);   // Compute k**-1 mod q
    var r = this.g.modPow(k, this.p).mod(this.q);  // r = (g**k mod p) mod q
    var s = inv_k.multiply(m.add(this.x.multiply(r))).mod(this.q);
    return [r, s];
  },

  verify : function(m, sig) {
    var r = sig[0];
    var s = sig[1];
    var zero = BigInteger.ZERO;
    // SECURITY TODO - We _should_ be computing SHA1(m), but we don't because that's the API.
    if (!(r.compareTo(zero) > 0 && this.q.compareTo(r) > 0) || !(s.compareTo(zero) > 0 && this.q.compareTo(s) > 0)) {
      return false;
    }
    var w = s.modInverse(this.q);
    var u1 = m.multiply(w).mod(this.q);
    var u2 = r.multiply(w).mod(this.q);
    var v = this.g.modPow(u1, this.p).multiply(this.y.modPow(u2, this.p)).mod(this.p).mod(this.q);
    return v.equals(r);
  },

  generate : function() {
    alert('NOT_IMPLEMENTED');
  }
};

// Source: kryptos/Random/_UserFriendlyRNG.js
kryptos.random.Random = function () {
  this._fa = new kryptos.random.Fortuna.FortunaAccumulator();
  this._ec = new kryptos.random._EntropyCollector(this._fa);
  this.reinit();
};

kryptos.random.Random.prototype = {
  reinit : function() {
    /*
      Initialize the random number generator and seed it with entropy from
      the operating system.
    */
    this._ec.reinit();
  },

  flush : function(s) {
    // pass
  },

  // Return N bytes from the RNG.
  read : function(N, dontFlush) {
    // Collect some entropy and feed it to Fortuna
    this._ec.collect(dontFlush);

    // Ask Fortuna to generate some bytes
    var retval = this._fa.random_data(N);

    // Return the random data.
    return retval;
  }
};


kryptos.random._EntropySource = function(accumulator, src_num) {
  this._fortuna = accumulator;
  this._src_num = src_num;
  this._pool_num = 0;
};

kryptos.random._EntropySource.prototype = {
  feed : function(data) {
    this._fortuna.add_random_event(this._src_num, this._pool_num, data);
    this._pool_num = (this._pool_num + 1) & 31;
  }
};

kryptos.random._EntropyCollector = function(accumulator) {
  this._osrng = new kryptos.random.OSRNG.BrowserRNG();
  this._osrng_es = new kryptos.random._EntropySource(accumulator, 255);
  this._time_es = new kryptos.random._EntropySource(accumulator, 254);
  this._time2_es = new kryptos.random._EntropySource(accumulator, 253);

  this.previousMilliseconds = new Date().getMilliseconds();
};

kryptos.random._EntropyCollector.prototype = {
  reinit : function() {
    // Add 256 bits to each of the 32 pools, twice.  (For a total of 16384
    // bits collected from the operating system.)
    for (var i = 0; i < 2; ++i) {
      var block = this._osrng.read(32*32);
      for (var p = 0; p < 32; ++p) {
        this._osrng_es.feed(block.substring(p*32,(p+1)*32));
      }
      block = null;
    }
    this._osrng.flush();
  },

  collect : function(dontFlush) {
    // Collect 64 bits of entropy from the operating system and feed it to Fortuna.
    this._osrng_es.feed(this._osrng.read(8, dontFlush));

    // Add the fractional part of date
    var t = new Date().getMilliseconds() * Math.random() / 1000;
    this._time_es.feed(struct.pack("@I", parseInt(Math.pow(2, 30) * (t - Math.floor(t)))));

    // Add another fractional part of date
    var newMilliseconds = new Date().getMilliseconds();
    t = ((this.previousMilliseconds + newMilliseconds) % 1000) * Math.random() / 1000;
    this.previousMilliseconds = newMilliseconds;
    this._time2_es.feed(struct.pack("@I", parseInt(Math.pow(2, 30) * (t - Math.floor(t)))));
  }
};

// Source: kryptos/Random/Fortuna/SHAd256.js
kryptos.random.Fortuna.SHAd256 = function(str) {
  inherit(this, new kryptos.hash.baseHash(str));
};

kryptos.random.Fortuna.SHAd256.digest_size = 32;

kryptos.random.Fortuna.SHAd256.prototype = {
  type : 'sha256',

  digest : function() {
    return new kryptos.hash.SHA256(new kryptos.hash.SHA256(this.data).digest()).digest();
  }
};

// Source: kryptos/Random/Fortuna/FortunaAccumulator.js
kryptos.random.Fortuna.FortunaPool = function() {
  /*
    Fortuna pool type

    This object acts like a hash object, with the following differences:

        - It keeps a count (the .length attribute) of the number of bytes that
          have been added to the pool
        - It supports a .reset() method for in-place reinitialization
        - The method to add bytes to the pool is .append(), not .update().
  */
  this.reset();
}

kryptos.random.Fortuna.FortunaPool.prototype = {
  digest_size : kryptos.random.Fortuna.SHAd256.digest_size,

  append : function(data) {
    this._h.update(data);
    this.length += data.length;
  },

  digest : function() {
    return this._h.digest();
  },

  reset : function() {
    this._h = new kryptos.random.Fortuna.SHAd256();
    this.length = 0;
  }
};


kryptos.random.Fortuna.which_pools = function(r) {
  /*
    Return a list of pools indexes (in range(32)) that are to be included during reseed number r.

    According to _Practical Cryptography_, chapter 10.5.2 "Pools":

        "Pool P_i is included if 2**i is a divisor of r.  Thus P_0 is used
        every reseed, P_1 every other reseed, P_2 every fourth reseed, etc."
  */
  // This is a separate function so that it can be unit-tested.

  var retval = [];
  var mask = 0;
  for (var i = 0; i < 32; ++i) {
    // "Pool P_i is included if 2**i is a divisor of [reseed_count]"
    if ((r & mask) == 0) {
      retval.push(i);
    } else {
      break;   // optimization.  once this fails, it always fails
    }
    mask = (mask << 1) | 1;
  }
  return retval;
}


kryptos.random.Fortuna.FortunaAccumulator = function() {
  this.reseed_count = 0;
  this.generator = new kryptos.random.Fortuna.FortunaGenerator.AESGenerator();
  this.last_reseed = null;

  // Initialize 32 FortunaPool instances.
  // NB: This is _not_ equivalent to [FortunaPool()]*32, which would give
  // us 32 references to the _same_ FortunaPool instance (and cause the
  // assertion below to fail).
  this.pools = [];
  for (var i = 0; i < 32; ++i) { // 32 pools
    this.pools.push(new kryptos.random.Fortuna.FortunaPool());
  }
}

kryptos.random.Fortuna.FortunaAccumulator.prototype = {
  min_pool_size : 64,       // TODO: explain why
  reseed_interval : 0.100,  // 100 ms    TODO: explain why

  random_data : function(bytes) {
    var current_time = new Date();
    if (this.last_reseed > current_time) {
      // warnings.warn("Clock rewind detected. Resetting last_reseed.", ClockRewindWarning)
      this.last_reseed = null;
    }
    if (this.pools[0].length >= this.min_pool_size &&
        (!this.last_reseed ||
         current_time > this.last_reseed + this.reseed_interval)) {
      this._reseed(current_time);
    }
    // The following should fail if we haven't seeded the pool yet.
    return this.generator.pseudo_random_data(bytes);
  },

  _reseed : function(current_time) {
    if (!current_time) {
      current_time = new Date();
    }
    var seed = [];
    this.reseed_count += 1;
    this.last_reseed = current_time;
    var which_pools = kryptos.random.Fortuna.which_pools(this.reseed_count);
    for (var i = 0; i < which_pools.length; ++i) {
      seed.push(this.pools[i].digest());
      this.pools[i].reset();
    }

    seed = seed.join("");
    this.generator.reseed(seed);
  },

  add_random_event : function(source_number, pool_number, data) {
    this.pools[pool_number].append(String.fromCharCode(source_number));
    this.pools[pool_number].append(String.fromCharCode(data.length));
    this.pools[pool_number].append(data);
  }
};

// Source: kryptos/Random/Fortuna/FortunaGenerator.js
kryptos.random.Fortuna.FortunaGenerator = {};

kryptos.random.Fortuna.FortunaGenerator.AESGenerator = function() {
  /*
    The Fortuna "generator"

    This is used internally by the Fortuna PRNG to generate arbitrary amounts
    of pseudorandom data from a smaller amount of seed data.

    The output is generated by running AES-256 in counter mode and re-keying
    after every mebibyte (2**16 blocks) of output.
  */

  this.counter = new paramikojs.util.Counter(this.block_size * 8, 0);
  this.key = null;

  // Set some helper constants
  this.block_size_shift = 4; // exact_log2(this.block_size);

  this.blocks_per_key = 2; // exact_div(this.key_size, this.block_size);

  this.max_bytes_per_request = this.max_blocks_per_request * this.block_size;
}

kryptos.random.Fortuna.FortunaGenerator.AESGenerator.prototype = {
  block_size : 16,     // output block size in octets (128 bits)
  key_size : 32,       // key size in octets (256 bits)

  // Because of the birthday paradox, we expect to find approximately one
  // collision for every 2**64 blocks of output from a real random source.
  // However, this code generates pseudorandom data by running AES in
  // counter mode, so there will be no collisions until the counter
  // (theoretically) wraps around at 2**128 blocks.  Thus, in order to prevent
  // Fortuna's pseudorandom output from deviating perceptibly from a true
  // random source, Ferguson and Schneier specify a limit of 2**16 blocks
  // without rekeying.
  max_blocks_per_request : Math.pow(2, 16),  // Allow no more than this number of blocks per _pseudo_random_data request

  _four_kiblocks_of_zeros : new Array(16 * 4096 + 1).join("\0"), // 16 == block_size

  reseed : function(seed) {
    if (!this.key) {
      this.key = new Array(this.key_size + 1).join("\0");
    }
    this._set_key(new kryptos.random.Fortuna.SHAd256(this.key + seed).digest());
    this.counter.call();  // increment counter
  },

  pseudo_random_data : function(bytes) {
    var num_full_blocks = bytes >> 20;
    var remainder = bytes & ((1<<20)-1);

    var retval = [];
    for (var i = 0; i < num_full_blocks; ++i) {
      retval.push(this._pseudo_random_data(1<<20));
    }
    retval.push(this._pseudo_random_data(remainder));

    return retval.join("");
  },

  _set_key : function(key) {
    this.key = key;
    this._cipher = new kryptos.cipher.AES(key, kryptos.cipher.AES.MODE_CTR, 0, this.counter);
  },

  _pseudo_random_data : function(bytes) {
    var num_blocks = Math.ceil(1.0 * bytes / this.block_size_shift);   // num_blocks = ceil(bytes / self.block_size)

    // Compute the output
    var retval = this._generate_blocks(num_blocks).substring(0, bytes);

    // Switch to a new key to avoid later compromises of this output (i.e.
    // state compromise extension attacks)
    this._set_key(this._generate_blocks(this.blocks_per_key));

    return retval;
  },

  _generate_blocks : function(num_blocks) {
    var retval = [];
    for (var i = 0; i < num_blocks >> 12; ++i) {      // xrange(num_blocks / 4096)
      retval.push(this._cipher.encrypt(this._four_kiblocks_of_zeros));
    }
    var remaining_bytes = (num_blocks & 4095) << this.block_size_shift;  // (num_blocks % 4095) * self.block_size
    retval.push(this._cipher.encrypt(this._four_kiblocks_of_zeros.substring(0, remaining_bytes)));
    return retval.join("");
  }
};

// Source: kryptos/Random/OSRNG/browser.js
kryptos.random.OSRNG.BrowserRNG = function() {

};

kryptos.random.OSRNG.BrowserRNG.prototype = {
  flush : function() {
    // pass
  },

  read : function(N) {
    var array = new Uint8Array(N);
    crypto.getRandomValues(array);

    var str = "";   // todo fixme - use native array types, and move to chrome worker
    for (var x = 0; x < N; ++x) {
      str += String.fromCharCode(array[x]);
    }

    return str;
  },

  close: function() {
    // pass
  }
};

// Source: python_shim.js
var binascii = {
  hexlify : function(str, padding) {
    var result = "";
    padding = padding || '';
    for (var x = 0; x < str.length; ++x) {
      var c = str.charCodeAt(x).toString(16);
      result += (c.length == 1 ? '0' : '') + c + padding;
    }
    return result;
  },

  unhexlify : function(str) {
    var result = "";
    for (var x = 0; x < str.length; x += 2) {
      result += String.fromCharCode(parseInt(str.charAt(x) + str.charAt(x + 1), 16));
    }
    return result;
  }
};

var base64 = {
  encodestring : function(input) {
    return window.btoa(input);
  },

  decodestring : function(input) {
    return window.atob(input);
  }
};

/*
   This is a dumbed down version of the python function only doing a couple formats and big-endian only currently.
   todo: allow for unlimited arguments
 */
var struct = {
  pack : function(fmt, v) {
    var type = fmt[1];
    var result = "";
    switch (type) {
      case 'Q':
        var ff = new BigInteger('ff', 16);
        result += String.fromCharCode(v.shiftRight(56).and(ff));
        result += String.fromCharCode(v.shiftRight(48).and(ff));
        result += String.fromCharCode(v.shiftRight(40).and(ff));
        result += String.fromCharCode(v.shiftRight(32).and(ff));
        result += String.fromCharCode(v.shiftRight(24).and(ff));
        result += String.fromCharCode(v.shiftRight(16).and(ff));
        result += String.fromCharCode(v.shiftRight(8).and(ff));
        result += String.fromCharCode(v.and(ff));
        break;
      case 'I':
        result += String.fromCharCode(v >>> 24 & 0xff);
        result += String.fromCharCode(v >>> 16 & 0xff);
        result += String.fromCharCode(v >>> 8  & 0xff);
        // fall through
      case 'B':
        result += String.fromCharCode(v        & 0xff);
        break;
    }

    return result;
  },

  unpack : function(fmt, str) {
    var type = fmt[1];
    var result = [];
    var index = 0;
    var v = 0;
    switch (type) {
      case 'Q':
        v = new BigInteger("0", 10);

        v = v.add(new BigInteger(str.charCodeAt(0).toString(), 10).shiftLeft(56));
        v = v.add(new BigInteger(str.charCodeAt(1).toString(), 10).shiftLeft(48));
        v = v.add(new BigInteger(str.charCodeAt(2).toString(), 10).shiftLeft(40));
        v = v.add(new BigInteger(str.charCodeAt(3).toString(), 10).shiftLeft(32));
        v = v.add(new BigInteger(str.charCodeAt(4).toString(), 10).shiftLeft(24));
        v = v.add(new BigInteger(str.charCodeAt(5).toString(), 10).shiftLeft(16));
        v = v.add(new BigInteger(str.charCodeAt(6).toString(), 10).shiftLeft(8));
        v = v.add(new BigInteger(str.charCodeAt(7).toString(), 10).shiftLeft(0));
        result.push(v);
        break;
      case 'I':
        v += str.charCodeAt(0) << 24 >>> 0;
        v += str.charCodeAt(1) << 16 >>> 0;
        v += str.charCodeAt(2) << 8  >>> 0;
        index += 3;
        // fall through
      case 'B':
        v += str.charCodeAt(0 + index) << 0  >>> 0;
        result.push(v);
        break;
    }

    return result;
  }
};

var sys = {
  'browser' : typeof window !== 'undefined' ? (navigator.userAgent.toLowerCase().indexOf('chrome') != -1 ? 'chrome' : 'mozilla') : 'server',
  'platform' : typeof window !== 'undefined' ? (navigator.platform.toLowerCase().indexOf('linux') != -1 ? 'linux' :
              (navigator.platform.toLowerCase().indexOf('mac') != -1   ? 'darwin' : 'win32')) : 'server'
};

// Source: BigInteger.js
var BigInteger = (function() {

/*
Licensing
---------

This software is covered under the following copyright:

 * Copyright (c) 2003-2005  Tom Wu
 * All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY
 * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
 *
 * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
 * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
 * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
 * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
 * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * In addition, the following condition applies:
 *
 * All redistributions must retain an intact copy of this copyright notice
 * and disclaimer.

Address all questions regarding this license to:

  Tom Wu
  tjw@cs.Stanford.EDU

*/

// Copyright (c) 2005  Tom Wu
// All Rights Reserved.
// See "LICENSE" for details.

// Basic JavaScript BN library - subset useful for RSA encryption.

// Bits per digit
var dbits;

// JavaScript engine analysis
var canary = 0xdeadbeefcafe;
var j_lm = ((canary&0xffffff)==0xefcafe);

// (public) Constructor
function BigInteger(a,b,c) {
  if(a != null)
    if("number" == typeof a) this.fromNumber(a,b,c);
    else if(b == null && "string" != typeof a) this.fromString(a,256);
    else this.fromString(a,b);
}

// return new, unset BigInteger
function nbi() { return new BigInteger(null); }

// am: Compute w_j += (x*this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.

// am1: use a single mult and divide to get the high bits,
// max digit bits should be 26 because
// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
function am1(i,x,w,j,c,n) {
  while(--n >= 0) {
    var v = x*this[i++]+w[j]+c;
    c = Math.floor(v/0x4000000);
    w[j++] = v&0x3ffffff;
  }
  return c;
}
// am2 avoids a big mult-and-extract completely.
// Max digit bits should be <= 30 because we do bitwise ops
// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
function am2(i,x,w,j,c,n) {
  var xl = x&0x7fff, xh = x>>15;
  while(--n >= 0) {
    var l = this[i]&0x7fff;
    var h = this[i++]>>15;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
    c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
    w[j++] = l&0x3fffffff;
  }
  return c;
}
// Alternately, set max digit bits to 28 since some
// browsers slow down when dealing with 32-bit numbers.
function am3(i,x,w,j,c,n) {
  var xl = x&0x3fff, xh = x>>14;
  while(--n >= 0) {
    var l = this[i]&0x3fff;
    var h = this[i++]>>14;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x3fff)<<14)+w[j]+c;
    c = (l>>28)+(m>>14)+xh*h;
    w[j++] = l&0xfffffff;
  }
  return c;
}
if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
  BigInteger.prototype.am = am2;
  dbits = 30;
}
else if(j_lm && (navigator.appName != "Netscape")) {
  BigInteger.prototype.am = am1;
  dbits = 26;
}
else { // Mozilla/Netscape seems to prefer am3
  BigInteger.prototype.am = am3;
  dbits = 28;
}

BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = ((1<<dbits)-1);
BigInteger.prototype.DV = (1<<dbits);

var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2,BI_FP);
BigInteger.prototype.F1 = BI_FP-dbits;
BigInteger.prototype.F2 = 2*dbits-BI_FP;

// Digit conversions
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
var BI_RC = new Array();
var rr,vv;
rr = "0".charCodeAt(0);
for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
rr = "a".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
rr = "A".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

function int2char(n) { return BI_RM.charAt(n); }
function intAt(s,i) {
  var c = BI_RC[s.charCodeAt(i)];
  return (c==null)?-1:c;
}

// (protected) copy this to r
function bnpCopyTo(r) {
  for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
  r.t = this.t;
  r.s = this.s;
}

// (protected) set from integer value x, -DV <= x < DV
function bnpFromInt(x) {
  this.t = 1;
  this.s = (x<0)?-1:0;
  if(x > 0) this[0] = x;
  else if(x < -1) this[0] = x+DV;
  else this.t = 0;
}

// return bigint initialized to value
function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

// (protected) set from string and radix
function bnpFromString(s,b) {
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 256) k = 8; // byte array
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else { this.fromRadix(s,b); return; }
  this.t = 0;
  this.s = 0;
  var i = s.length, mi = false, sh = 0;
  while(--i >= 0) {
    var x = (k==8)?s[i]&0xff:intAt(s,i);
    if(x < 0) {
      if(s.charAt(i) == "-") mi = true;
      continue;
    }
    mi = false;
    if(sh == 0)
      this[this.t++] = x;
    else if(sh+k > this.DB) {
      this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
      this[this.t++] = (x>>(this.DB-sh));
    }
    else
      this[this.t-1] |= x<<sh;
    sh += k;
    if(sh >= this.DB) sh -= this.DB;
  }
  if(k == 8 && (s[0]&0x80) != 0) {
    this.s = -1;
    if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
  }
  this.clamp();
  if(mi) BigInteger.ZERO.subTo(this,this);
}

// (protected) clamp off excess high words
function bnpClamp() {
  var c = this.s&this.DM;
  while(this.t > 0 && this[this.t-1] == c) --this.t;
}

// (public) return string representation in given radix
function bnToString(b) {
  if(this.s < 0) return "-"+this.negate().toString(b);
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else return this.toRadix(b);
  var km = (1<<k)-1, d, m = false, r = "", i = this.t;
  var p = this.DB-(i*this.DB)%k;
  if(i-- > 0) {
    if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
    while(i >= 0) {
      if(p < k) {
        d = (this[i]&((1<<p)-1))<<(k-p);
        d |= this[--i]>>(p+=this.DB-k);
      }
      else {
        d = (this[i]>>(p-=k))&km;
        if(p <= 0) { p += this.DB; --i; }
      }
      if(d > 0) m = true;
      if(m) r += int2char(d);
    }
  }
  return m?r:"0";
}

// (public) -this
function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

// (public) |this|
function bnAbs() { return (this.s<0)?this.negate():this; }

// (public) return + if this > a, - if this < a, 0 if equal
function bnCompareTo(a) {
  var r = this.s-a.s;
  if(r != 0) return r;
  var i = this.t;
  r = i-a.t;
  if(r != 0) return r;
  while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
  return 0;
}

// returns bit length of the integer x
function nbits(x) {
  var r = 1, t;
  if((t=x>>>16) != 0) { x = t; r += 16; }
  if((t=x>>8) != 0) { x = t; r += 8; }
  if((t=x>>4) != 0) { x = t; r += 4; }
  if((t=x>>2) != 0) { x = t; r += 2; }
  if((t=x>>1) != 0) { x = t; r += 1; }
  return r;
}

// (public) return the number of bits in "this"
function bnBitLength() {
  if(this.t <= 0) return 0;
  return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
}

// (protected) r = this << n*DB
function bnpDLShiftTo(n,r) {
  var i;
  for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
  for(i = n-1; i >= 0; --i) r[i] = 0;
  r.t = this.t+n;
  r.s = this.s;
}

// (protected) r = this >> n*DB
function bnpDRShiftTo(n,r) {
  for(var i = n; i < this.t; ++i) r[i-n] = this[i];
  r.t = Math.max(this.t-n,0);
  r.s = this.s;
}

// (protected) r = this << n
function bnpLShiftTo(n,r) {
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<cbs)-1;
  var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
  for(i = this.t-1; i >= 0; --i) {
    r[i+ds+1] = (this[i]>>cbs)|c;
    c = (this[i]&bm)<<bs;
  }
  for(i = ds-1; i >= 0; --i) r[i] = 0;
  r[ds] = c;
  r.t = this.t+ds+1;
  r.s = this.s;
  r.clamp();
}

// (protected) r = this >> n
function bnpRShiftTo(n,r) {
  r.s = this.s;
  var ds = Math.floor(n/this.DB);
  if(ds >= this.t) { r.t = 0; return; }
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<bs)-1;
  r[0] = this[ds]>>bs;
  for(var i = ds+1; i < this.t; ++i) {
    r[i-ds-1] |= (this[i]&bm)<<cbs;
    r[i-ds] = this[i]>>bs;
  }
  if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
  r.t = this.t-ds;
  r.clamp();
}

// (protected) r = this - a
function bnpSubTo(a,r) {
  var i = 0, c = 0, m = Math.min(a.t,this.t);
  while(i < m) {
    c += this[i]-a[i];
    r[i++] = c&this.DM;
    c >>= this.DB;
  }
  if(a.t < this.t) {
    c -= a.s;
    while(i < this.t) {
      c += this[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += this.s;
  }
  else {
    c += this.s;
    while(i < a.t) {
      c -= a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c -= a.s;
  }
  r.s = (c<0)?-1:0;
  if(c < -1) r[i++] = this.DV+c;
  else if(c > 0) r[i++] = c;
  r.t = i;
  r.clamp();
}

// (protected) r = this * a, r != this,a (HAC 14.12)
// "this" should be the larger one if appropriate.
function bnpMultiplyTo(a,r) {
  var x = this.abs(), y = a.abs();
  var i = x.t;
  r.t = i+y.t;
  while(--i >= 0) r[i] = 0;
  for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
  r.s = 0;
  r.clamp();
  if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
}

// (protected) r = this^2, r != this (HAC 14.16)
function bnpSquareTo(r) {
  var x = this.abs();
  var i = r.t = 2*x.t;
  while(--i >= 0) r[i] = 0;
  for(i = 0; i < x.t-1; ++i) {
    var c = x.am(i,x[i],r,2*i,0,1);
    if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
      r[i+x.t] -= x.DV;
      r[i+x.t+1] = 1;
    }
  }
  if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
  r.s = 0;
  r.clamp();
}

// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
// r != q, this != m.  q or r may be null.
function bnpDivRemTo(m,q,r) {
  var pm = m.abs();
  if(pm.t <= 0) return;
  var pt = this.abs();
  if(pt.t < pm.t) {
    if(q != null) q.fromInt(0);
    if(r != null) this.copyTo(r);
    return;
  }
  if(r == null) r = nbi();
  var y = nbi(), ts = this.s, ms = m.s;
  var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
  if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
  else { pm.copyTo(y); pt.copyTo(r); }
  var ys = y.t;
  var y0 = y[ys-1];
  if(y0 == 0) return;
  var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
  var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
  var i = r.t, j = i-ys, t = (q==null)?nbi():q;
  y.dlShiftTo(j,t);
  if(r.compareTo(t) >= 0) {
    r[r.t++] = 1;
    r.subTo(t,r);
  }
  BigInteger.ONE.dlShiftTo(ys,t);
  t.subTo(y,y);	// "negative" y so we can replace sub with am later
  while(y.t < ys) y[y.t++] = 0;
  while(--j >= 0) {
    // Estimate quotient digit
    var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
    if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
      y.dlShiftTo(j,t);
      r.subTo(t,r);
      while(r[i] < --qd) r.subTo(t,r);
    }
  }
  if(q != null) {
    r.drShiftTo(ys,q);
    if(ts != ms) BigInteger.ZERO.subTo(q,q);
  }
  r.t = ys;
  r.clamp();
  if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
  if(ts < 0) BigInteger.ZERO.subTo(r,r);
}

// (public) this mod a
function bnMod(a) {
  var r = nbi();
  this.abs().divRemTo(a,null,r);
  if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
  return r;
}

// Modular reduction using "classic" algorithm
function Classic(m) { this.m = m; }
function cConvert(x) {
  if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
  else return x;
}
function cRevert(x) { return x; }
function cReduce(x) { x.divRemTo(this.m,null,x); }
function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

Classic.prototype.convert = cConvert;
Classic.prototype.revert = cRevert;
Classic.prototype.reduce = cReduce;
Classic.prototype.mulTo = cMulTo;
Classic.prototype.sqrTo = cSqrTo;

// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
// justification:
//         xy == 1 (mod m)
//         xy =  1+km
//   xy(2-xy) = (1+km)(1-km)
// x[y(2-xy)] = 1-k^2m^2
// x[y(2-xy)] == 1 (mod m^2)
// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
// JS multiply "overflows" differently from C/C++, so care is needed here.
function bnpInvDigit() {
  if(this.t < 1) return 0;
  var x = this[0];
  if((x&1) == 0) return 0;
  var y = x&3;		// y == 1/x mod 2^2
  y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
  y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
  y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
  // last step - calculate inverse mod DV directly;
  // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
  y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
  // we really want the negative inverse, and -DV < y < DV
  return (y>0)?this.DV-y:-y;
}

// Montgomery reduction
function Montgomery(m) {
  this.m = m;
  this.mp = m.invDigit();
  this.mpl = this.mp&0x7fff;
  this.mph = this.mp>>15;
  this.um = (1<<(m.DB-15))-1;
  this.mt2 = 2*m.t;
}

// xR mod m
function montConvert(x) {
  var r = nbi();
  x.abs().dlShiftTo(this.m.t,r);
  r.divRemTo(this.m,null,r);
  if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
  return r;
}

// x/R mod m
function montRevert(x) {
  var r = nbi();
  x.copyTo(r);
  this.reduce(r);
  return r;
}

// x = x/R mod m (HAC 14.32)
function montReduce(x) {
  while(x.t <= this.mt2)	// pad x so am has enough room later
    x[x.t++] = 0;
  for(var i = 0; i < this.m.t; ++i) {
    // faster way of calculating u0 = x[i]*mp mod DV
    var j = x[i]&0x7fff;
    var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
    // use am to combine the multiply-shift-add into one call
    j = i+this.m.t;
    x[j] += this.m.am(0,u0,x,i,0,this.m.t);
    // propagate carry
    while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
  }
  x.clamp();
  x.drShiftTo(this.m.t,x);
  if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

// r = "x^2/R mod m"; x != r
function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

// r = "xy/R mod m"; x,y != r
function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Montgomery.prototype.convert = montConvert;
Montgomery.prototype.revert = montRevert;
Montgomery.prototype.reduce = montReduce;
Montgomery.prototype.mulTo = montMulTo;
Montgomery.prototype.sqrTo = montSqrTo;

// (protected) true iff this is even
function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
function bnpExp(e,z) {
  if(e > 0xffffffff || e < 1) return BigInteger.ONE;
  var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
  g.copyTo(r);
  while(--i >= 0) {
    z.sqrTo(r,r2);
    if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
    else { var t = r; r = r2; r2 = t; }
  }
  return z.revert(r);
}

// (public) this^e % m, 0 <= e < 2^32
function bnModPowInt(e,m) {
  var z;
  if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
  return this.exp(e,z);
}

// protected
BigInteger.prototype.copyTo = bnpCopyTo;
BigInteger.prototype.fromInt = bnpFromInt;
BigInteger.prototype.fromString = bnpFromString;
BigInteger.prototype.clamp = bnpClamp;
BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
BigInteger.prototype.drShiftTo = bnpDRShiftTo;
BigInteger.prototype.lShiftTo = bnpLShiftTo;
BigInteger.prototype.rShiftTo = bnpRShiftTo;
BigInteger.prototype.subTo = bnpSubTo;
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
BigInteger.prototype.squareTo = bnpSquareTo;
BigInteger.prototype.divRemTo = bnpDivRemTo;
BigInteger.prototype.invDigit = bnpInvDigit;
BigInteger.prototype.isEven = bnpIsEven;
BigInteger.prototype.exp = bnpExp;

// public
BigInteger.prototype.toString = bnToString;
BigInteger.prototype.negate = bnNegate;
BigInteger.prototype.abs = bnAbs;
BigInteger.prototype.compareTo = bnCompareTo;
BigInteger.prototype.bitLength = bnBitLength;
BigInteger.prototype.mod = bnMod;
BigInteger.prototype.modPowInt = bnModPowInt;

// "constants"
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);

// Copyright (c) 2005-2009  Tom Wu
// All Rights Reserved.
// See "LICENSE" for details.

// Extended JavaScript BN functions, required for RSA private ops.

// Version 1.1: new BigInteger("0", 10) returns "proper" zero

// (public)
function bnClone() { var r = nbi(); this.copyTo(r); return r; }

// (public) return value as integer
function bnIntValue() {
  if(this.s < 0) {
    if(this.t == 1) return this[0]-this.DV;
    else if(this.t == 0) return -1;
  }
  else if(this.t == 1) return this[0];
  else if(this.t == 0) return 0;
  // assumes 16 < DB < 32
  return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
}

// (public) return value as byte
function bnByteValue() { return (this.t==0)?this.s:(this[0]<<24)>>24; }

// (public) return value as short (assumes DB>=16)
function bnShortValue() { return (this.t==0)?this.s:(this[0]<<16)>>16; }

// (protected) return x s.t. r^x < DV
function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

// (public) 0 if this == 0, 1 if this > 0
function bnSigNum() {
  if(this.s < 0) return -1;
  else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
  else return 1;
}

// (protected) convert to radix string
function bnpToRadix(b) {
  if(b == null) b = 10;
  if(this.signum() == 0 || b < 2 || b > 36) return "0";
  var cs = this.chunkSize(b);
  var a = Math.pow(b,cs);
  var d = nbv(a), y = nbi(), z = nbi(), r = "";
  this.divRemTo(d,y,z);
  while(y.signum() > 0) {
    r = (a+z.intValue()).toString(b).substr(1) + r;
    y.divRemTo(d,y,z);
  }
  return z.intValue().toString(b) + r;
}

// (protected) convert from radix string
function bnpFromRadix(s,b) {
  this.fromInt(0);
  if(b == null) b = 10;
  var cs = this.chunkSize(b);
  var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
  for(var i = 0; i < s.length; ++i) {
    var x = intAt(s,i);
    if(x < 0) {
      if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
      continue;
    }
    w = b*w+x;
    if(++j >= cs) {
      this.dMultiply(d);
      this.dAddOffset(w,0);
      j = 0;
      w = 0;
    }
  }
  if(j > 0) {
    this.dMultiply(Math.pow(b,j));
    this.dAddOffset(w,0);
  }
  if(mi) BigInteger.ZERO.subTo(this,this);
}

// (protected) alternate constructor
function bnpFromNumber(a,b,c) {
  if("number" == typeof b) {
    // new BigInteger(int,int,RNG)
    if(a < 2) this.fromInt(1);
    else {
      this.fromNumber(a,c);
      if(!this.testBit(a-1))	// force MSB set
        this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this);
      if(this.isEven()) this.dAddOffset(1,0); // force odd
      while(!this.isProbablePrime(b)) {
        this.dAddOffset(2,0);
        if(this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a-1),this);
      }
    }
  }
  else {
    // new BigInteger(int,RNG)
    var x = new Array(), t = a&7;
    x.length = (a>>3)+1;
    b.nextBytes(x);
    if(t > 0) x[0] &= ((1<<t)-1); else x[0] = 0;
    this.fromString(x,256);
  }
}

// (public) convert to bigendian byte array
function bnToByteArray() {
  var i = this.t, r = new Array();
  r[0] = this.s;
  var p = this.DB-(i*this.DB)%8, d, k = 0;
  if(i-- > 0) {
    if(p < this.DB && (d = this[i]>>p) != (this.s&this.DM)>>p)
      r[k++] = d|(this.s<<(this.DB-p));
    while(i >= 0) {
      if(p < 8) {
        d = (this[i]&((1<<p)-1))<<(8-p);
        d |= this[--i]>>(p+=this.DB-8);
      }
      else {
        d = (this[i]>>(p-=8))&0xff;
        if(p <= 0) { p += this.DB; --i; }
      }
      if((d&0x80) != 0) d |= -256;
      if(k == 0 && (this.s&0x80) != (d&0x80)) ++k;
      if(k > 0 || d != this.s) r[k++] = d;
    }
  }
  return r;
}

function bnEquals(a) { return(this.compareTo(a)==0); }
function bnMin(a) { return(this.compareTo(a)<0)?this:a; }
function bnMax(a) { return(this.compareTo(a)>0)?this:a; }

// (protected) r = this op a (bitwise)
function bnpBitwiseTo(a,op,r) {
  var i, f, m = Math.min(a.t,this.t);
  for(i = 0; i < m; ++i) r[i] = op(this[i],a[i]);
  if(a.t < this.t) {
    f = a.s&this.DM;
    for(i = m; i < this.t; ++i) r[i] = op(this[i],f);
    r.t = this.t;
  }
  else {
    f = this.s&this.DM;
    for(i = m; i < a.t; ++i) r[i] = op(f,a[i]);
    r.t = a.t;
  }
  r.s = op(this.s,a.s);
  r.clamp();
}

// (public) this & a
function op_and(x,y) { return x&y; }
function bnAnd(a) { var r = nbi(); this.bitwiseTo(a,op_and,r); return r; }

// (public) this | a
function op_or(x,y) { return x|y; }
function bnOr(a) { var r = nbi(); this.bitwiseTo(a,op_or,r); return r; }

// (public) this ^ a
function op_xor(x,y) { return x^y; }
function bnXor(a) { var r = nbi(); this.bitwiseTo(a,op_xor,r); return r; }

// (public) this & ~a
function op_andnot(x,y) { return x&~y; }
function bnAndNot(a) { var r = nbi(); this.bitwiseTo(a,op_andnot,r); return r; }

// (public) ~this
function bnNot() {
  var r = nbi();
  for(var i = 0; i < this.t; ++i) r[i] = this.DM&~this[i];
  r.t = this.t;
  r.s = ~this.s;
  return r;
}

// (public) this << n
function bnShiftLeft(n) {
  var r = nbi();
  if(n < 0) this.rShiftTo(-n,r); else this.lShiftTo(n,r);
  return r;
}

// (public) this >> n
function bnShiftRight(n) {
  var r = nbi();
  if(n < 0) this.lShiftTo(-n,r); else this.rShiftTo(n,r);
  return r;
}

// return index of lowest 1-bit in x, x < 2^31
function lbit(x) {
  if(x == 0) return -1;
  var r = 0;
  if((x&0xffff) == 0) { x >>= 16; r += 16; }
  if((x&0xff) == 0) { x >>= 8; r += 8; }
  if((x&0xf) == 0) { x >>= 4; r += 4; }
  if((x&3) == 0) { x >>= 2; r += 2; }
  if((x&1) == 0) ++r;
  return r;
}

// (public) returns index of lowest 1-bit (or -1 if none)
function bnGetLowestSetBit() {
  for(var i = 0; i < this.t; ++i)
    if(this[i] != 0) return i*this.DB+lbit(this[i]);
  if(this.s < 0) return this.t*this.DB;
  return -1;
}

// return number of 1 bits in x
function cbit(x) {
  var r = 0;
  while(x != 0) { x &= x-1; ++r; }
  return r;
}

// (public) return number of set bits
function bnBitCount() {
  var r = 0, x = this.s&this.DM;
  for(var i = 0; i < this.t; ++i) r += cbit(this[i]^x);
  return r;
}

// (public) true iff nth bit is set
function bnTestBit(n) {
  var j = Math.floor(n/this.DB);
  if(j >= this.t) return(this.s!=0);
  return((this[j]&(1<<(n%this.DB)))!=0);
}

// (protected) this op (1<<n)
function bnpChangeBit(n,op) {
  var r = BigInteger.ONE.shiftLeft(n);
  this.bitwiseTo(r,op,r);
  return r;
}

// (public) this | (1<<n)
function bnSetBit(n) { return this.changeBit(n,op_or); }

// (public) this & ~(1<<n)
function bnClearBit(n) { return this.changeBit(n,op_andnot); }

// (public) this ^ (1<<n)
function bnFlipBit(n) { return this.changeBit(n,op_xor); }

// (protected) r = this + a
function bnpAddTo(a,r) {
  var i = 0, c = 0, m = Math.min(a.t,this.t);
  while(i < m) {
    c += this[i]+a[i];
    r[i++] = c&this.DM;
    c >>= this.DB;
  }
  if(a.t < this.t) {
    c += a.s;
    while(i < this.t) {
      c += this[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += this.s;
  }
  else {
    c += this.s;
    while(i < a.t) {
      c += a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += a.s;
  }
  r.s = (c<0)?-1:0;
  if(c > 0) r[i++] = c;
  else if(c < -1) r[i++] = this.DV+c;
  r.t = i;
  r.clamp();
}

// (public) this + a
function bnAdd(a) { var r = nbi(); this.addTo(a,r); return r; }

// (public) this - a
function bnSubtract(a) { var r = nbi(); this.subTo(a,r); return r; }

// (public) this * a
function bnMultiply(a) { var r = nbi(); this.multiplyTo(a,r); return r; }

// (public) this / a
function bnDivide(a) { var r = nbi(); this.divRemTo(a,r,null); return r; }

// (public) this % a
function bnRemainder(a) { var r = nbi(); this.divRemTo(a,null,r); return r; }

// (public) [this/a,this%a]
function bnDivideAndRemainder(a) {
  var q = nbi(), r = nbi();
  this.divRemTo(a,q,r);
  return new Array(q,r);
}

// (protected) this *= n, this >= 0, 1 < n < DV
function bnpDMultiply(n) {
  this[this.t] = this.am(0,n-1,this,0,0,this.t);
  ++this.t;
  this.clamp();
}

// (protected) this += n << w words, this >= 0
function bnpDAddOffset(n,w) {
  if(n == 0) return;
  while(this.t <= w) this[this.t++] = 0;
  this[w] += n;
  while(this[w] >= this.DV) {
    this[w] -= this.DV;
    if(++w >= this.t) this[this.t++] = 0;
    ++this[w];
  }
}

// A "null" reducer
function NullExp() {}
function nNop(x) { return x; }
function nMulTo(x,y,r) { x.multiplyTo(y,r); }
function nSqrTo(x,r) { x.squareTo(r); }

NullExp.prototype.convert = nNop;
NullExp.prototype.revert = nNop;
NullExp.prototype.mulTo = nMulTo;
NullExp.prototype.sqrTo = nSqrTo;

// (public) this^e
function bnPow(e) { return this.exp(e,new NullExp()); }

// (protected) r = lower n words of "this * a", a.t <= n
// "this" should be the larger one if appropriate.
function bnpMultiplyLowerTo(a,n,r) {
  var i = Math.min(this.t+a.t,n);
  r.s = 0; // assumes a,this >= 0
  r.t = i;
  while(i > 0) r[--i] = 0;
  var j;
  for(j = r.t-this.t; i < j; ++i) r[i+this.t] = this.am(0,a[i],r,i,0,this.t);
  for(j = Math.min(a.t,n); i < j; ++i) this.am(0,a[i],r,i,0,n-i);
  r.clamp();
}

// (protected) r = "this * a" without lower n words, n > 0
// "this" should be the larger one if appropriate.
function bnpMultiplyUpperTo(a,n,r) {
  --n;
  var i = r.t = this.t+a.t-n;
  r.s = 0; // assumes a,this >= 0
  while(--i >= 0) r[i] = 0;
  for(i = Math.max(n-this.t,0); i < a.t; ++i)
    r[this.t+i-n] = this.am(n-i,a[i],r,0,0,this.t+i-n);
  r.clamp();
  r.drShiftTo(1,r);
}

// Barrett modular reduction
function Barrett(m) {
  // setup Barrett
  this.r2 = nbi();
  this.q3 = nbi();
  BigInteger.ONE.dlShiftTo(2*m.t,this.r2);
  this.mu = this.r2.divide(m);
  this.m = m;
}

function barrettConvert(x) {
  if(x.s < 0 || x.t > 2*this.m.t) return x.mod(this.m);
  else if(x.compareTo(this.m) < 0) return x;
  else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
}

function barrettRevert(x) { return x; }

// x = x mod m (HAC 14.42)
function barrettReduce(x) {
  x.drShiftTo(this.m.t-1,this.r2);
  if(x.t > this.m.t+1) { x.t = this.m.t+1; x.clamp(); }
  this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);
  this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);
  while(x.compareTo(this.r2) < 0) x.dAddOffset(1,this.m.t+1);
  x.subTo(this.r2,x);
  while(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

// r = x^2 mod m; x != r
function barrettSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

// r = x*y mod m; x,y != r
function barrettMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Barrett.prototype.convert = barrettConvert;
Barrett.prototype.revert = barrettRevert;
Barrett.prototype.reduce = barrettReduce;
Barrett.prototype.mulTo = barrettMulTo;
Barrett.prototype.sqrTo = barrettSqrTo;

// (public) this^e % m (HAC 14.85)
function bnModPow(e,m) {
  var i = e.bitLength(), k, r = nbv(1), z;
  if(i <= 0) return r;
  else if(i < 18) k = 1;
  else if(i < 48) k = 3;
  else if(i < 144) k = 4;
  else if(i < 768) k = 5;
  else k = 6;
  if(i < 8)
    z = new Classic(m);
  else if(m.isEven())
    z = new Barrett(m);
  else
    z = new Montgomery(m);

  // precomputation
  var g = new Array(), n = 3, k1 = k-1, km = (1<<k)-1;
  g[1] = z.convert(this);
  if(k > 1) {
    var g2 = nbi();
    z.sqrTo(g[1],g2);
    while(n <= km) {
      g[n] = nbi();
      z.mulTo(g2,g[n-2],g[n]);
      n += 2;
    }
  }

  var j = e.t-1, w, is1 = true, r2 = nbi(), t;
  i = nbits(e[j])-1;
  while(j >= 0) {
    if(i >= k1) w = (e[j]>>(i-k1))&km;
    else {
      w = (e[j]&((1<<(i+1))-1))<<(k1-i);
      if(j > 0) w |= e[j-1]>>(this.DB+i-k1);
    }

    n = k;
    while((w&1) == 0) { w >>= 1; --n; }
    if((i -= n) < 0) { i += this.DB; --j; }
    if(is1) {	// ret == 1, don't bother squaring or multiplying it
      g[w].copyTo(r);
      is1 = false;
    }
    else {
      while(n > 1) { z.sqrTo(r,r2); z.sqrTo(r2,r); n -= 2; }
      if(n > 0) z.sqrTo(r,r2); else { t = r; r = r2; r2 = t; }
      z.mulTo(r2,g[w],r);
    }

    while(j >= 0 && (e[j]&(1<<i)) == 0) {
      z.sqrTo(r,r2); t = r; r = r2; r2 = t;
      if(--i < 0) { i = this.DB-1; --j; }
    }
  }
  return z.revert(r);
}

// (public) gcd(this,a) (HAC 14.54)
function bnGCD(a) {
  var x = (this.s<0)?this.negate():this.clone();
  var y = (a.s<0)?a.negate():a.clone();
  if(x.compareTo(y) < 0) { var t = x; x = y; y = t; }
  var i = x.getLowestSetBit(), g = y.getLowestSetBit();
  if(g < 0) return x;
  if(i < g) g = i;
  if(g > 0) {
    x.rShiftTo(g,x);
    y.rShiftTo(g,y);
  }
  while(x.signum() > 0) {
    if((i = x.getLowestSetBit()) > 0) x.rShiftTo(i,x);
    if((i = y.getLowestSetBit()) > 0) y.rShiftTo(i,y);
    if(x.compareTo(y) >= 0) {
      x.subTo(y,x);
      x.rShiftTo(1,x);
    }
    else {
      y.subTo(x,y);
      y.rShiftTo(1,y);
    }
  }
  if(g > 0) y.lShiftTo(g,y);
  return y;
}

// (protected) this % n, n < 2^26
function bnpModInt(n) {
  if(n <= 0) return 0;
  var d = this.DV%n, r = (this.s<0)?n-1:0;
  if(this.t > 0)
    if(d == 0) r = this[0]%n;
    else for(var i = this.t-1; i >= 0; --i) r = (d*r+this[i])%n;
  return r;
}

// (public) 1/this % m (HAC 14.61)
function bnModInverse(m) {
  var ac = m.isEven();
  if((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
  var u = m.clone(), v = this.clone();
  var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
  while(u.signum() != 0) {
    while(u.isEven()) {
      u.rShiftTo(1,u);
      if(ac) {
        if(!a.isEven() || !b.isEven()) { a.addTo(this,a); b.subTo(m,b); }
        a.rShiftTo(1,a);
      }
      else if(!b.isEven()) b.subTo(m,b);
      b.rShiftTo(1,b);
    }
    while(v.isEven()) {
      v.rShiftTo(1,v);
      if(ac) {
        if(!c.isEven() || !d.isEven()) { c.addTo(this,c); d.subTo(m,d); }
        c.rShiftTo(1,c);
      }
      else if(!d.isEven()) d.subTo(m,d);
      d.rShiftTo(1,d);
    }
    if(u.compareTo(v) >= 0) {
      u.subTo(v,u);
      if(ac) a.subTo(c,a);
      b.subTo(d,b);
    }
    else {
      v.subTo(u,v);
      if(ac) c.subTo(a,c);
      d.subTo(b,d);
    }
  }
  if(v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
  if(d.compareTo(m) >= 0) return d.subtract(m);
  if(d.signum() < 0) d.addTo(m,d); else return d;
  if(d.signum() < 0) return d.add(m); else return d;
}

var lowprimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509];
var lplim = (1<<26)/lowprimes[lowprimes.length-1];

// (public) test primality with certainty >= 1-.5^t
function bnIsProbablePrime(t) {
  var i, x = this.abs();
  if(x.t == 1 && x[0] <= lowprimes[lowprimes.length-1]) {
    for(i = 0; i < lowprimes.length; ++i)
      if(x[0] == lowprimes[i]) return true;
    return false;
  }
  if(x.isEven()) return false;
  i = 1;
  while(i < lowprimes.length) {
    var m = lowprimes[i], j = i+1;
    while(j < lowprimes.length && m < lplim) m *= lowprimes[j++];
    m = x.modInt(m);
    while(i < j) if(m%lowprimes[i++] == 0) return false;
  }
  return x.millerRabin(t);
}

// (protected) true if probably prime (HAC 4.24, Miller-Rabin)
function bnpMillerRabin(t) {
  var n1 = this.subtract(BigInteger.ONE);
  var k = n1.getLowestSetBit();
  if(k <= 0) return false;
  var r = n1.shiftRight(k);
  t = (t+1)>>1;
  if(t > lowprimes.length) t = lowprimes.length;
  var a = nbi();
  for(var i = 0; i < t; ++i) {
    a.fromInt(lowprimes[i]);
    var y = a.modPow(r,this);
    if(y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
      var j = 1;
      while(j++ < k && y.compareTo(n1) != 0) {
        y = y.modPowInt(2,this);
        if(y.compareTo(BigInteger.ONE) == 0) return false;
      }
      if(y.compareTo(n1) != 0) return false;
    }
  }
  return true;
}

// protected
BigInteger.prototype.chunkSize = bnpChunkSize;
BigInteger.prototype.toRadix = bnpToRadix;
BigInteger.prototype.fromRadix = bnpFromRadix;
BigInteger.prototype.fromNumber = bnpFromNumber;
BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
BigInteger.prototype.changeBit = bnpChangeBit;
BigInteger.prototype.addTo = bnpAddTo;
BigInteger.prototype.dMultiply = bnpDMultiply;
BigInteger.prototype.dAddOffset = bnpDAddOffset;
BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
BigInteger.prototype.modInt = bnpModInt;
BigInteger.prototype.millerRabin = bnpMillerRabin;

// public
BigInteger.prototype.clone = bnClone;
BigInteger.prototype.intValue = bnIntValue;
BigInteger.prototype.byteValue = bnByteValue;
BigInteger.prototype.shortValue = bnShortValue;
BigInteger.prototype.signum = bnSigNum;
BigInteger.prototype.toByteArray = bnToByteArray;
BigInteger.prototype.equals = bnEquals;
BigInteger.prototype.min = bnMin;
BigInteger.prototype.max = bnMax;
BigInteger.prototype.and = bnAnd;
BigInteger.prototype.or = bnOr;
BigInteger.prototype.xor = bnXor;
BigInteger.prototype.andNot = bnAndNot;
BigInteger.prototype.not = bnNot;
BigInteger.prototype.shiftLeft = bnShiftLeft;
BigInteger.prototype.shiftRight = bnShiftRight;
BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
BigInteger.prototype.bitCount = bnBitCount;
BigInteger.prototype.testBit = bnTestBit;
BigInteger.prototype.setBit = bnSetBit;
BigInteger.prototype.clearBit = bnClearBit;
BigInteger.prototype.flipBit = bnFlipBit;
BigInteger.prototype.add = bnAdd;
BigInteger.prototype.subtract = bnSubtract;
BigInteger.prototype.multiply = bnMultiply;
BigInteger.prototype.divide = bnDivide;
BigInteger.prototype.remainder = bnRemainder;
BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
BigInteger.prototype.modPow = bnModPow;
BigInteger.prototype.modInverse = bnModInverse;
BigInteger.prototype.pow = bnPow;
BigInteger.prototype.gcd = bnGCD;
BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

// BigInteger interfaces not implemented in jsbn:

// BigInteger(int signum, byte[] magnitude)
// double doubleValue()
// float floatValue()
// int hashCode()
// long longValue()
// static BigInteger valueOf(long val)

return {
  BigInteger : BigInteger
};
})();
BigInteger = BigInteger.BigInteger;

// Source: agent.js
/*
  Client interface for using private keys from an SSH agent running on the
  local machine.  If an SSH agent is running, this class can be used to
  connect to it and retreive L{PKey} objects which can be used when
  attempting to authenticate to remote SSH servers.

  Because the SSH agent protocol uses environment variables and unix-domain
  sockets, this probably doesn't work on Windows.  It does work on most
  posix platforms though (Linux and MacOS X, for example).
*/
paramikojs.Agent = function () {
  /*
    Open a session with the local machine's SSH agent, if one is running.
    If no agent is running, initialization will succeed, but L{get_keys}
    will return an empty tuple.

    @raise SSHException: if an SSH agent is found, but speaks an
        incompatible protocol
  */

  this.conn = null;
  this.keys = [];

  if(!(window.Components && window.Components.classes)) {
    throw new Error("Unable to use OS environment without Mozilla's Components.classes"); //FIXME
  }
  var userEnvironment = window.Components.classes["@mozilla.org/process/environment;1"].getService(window.Components.interfaces.nsIEnvironment);
  if (userEnvironment.exists('SSH_AUTH_SOCK') && sys.platform != 'win32') {
    var conn = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM); // todo, fixme, doesn't work right now :-/
    var auth_sock = userEnvironment.get('SSH_AUTH_SOCK');
    try {
      conn.connect(auth_sock);
    } catch(ex) {
      // probably a dangling env var: the ssh agent is gone
      return;
    }
    this.conn = conn;
  } else if (sys.platform == 'win32') {
    var win_pageant = new paramikojs.win_pageant();
    if (win_pageant.can_talk_to_agent()) {
      this.conn = win_pageant.PageantConnection();
    } else {
      return;
    }
  } else {
    // no agent support
    return;
  }

  var msg = this._send_message(String.fromCharCode(paramikojs.Agent.SSH2_AGENTC_REQUEST_IDENTITIES));
  if (msg.ptype != paramikojs.Agent.SSH2_AGENT_IDENTITIES_ANSWER) {
    throw new paramikojs.ssh_exception.SSHException('could not get keys from ssh-agent');
  }

  var max = msg.result.get_int();
  for (var x = 0; x < max; ++x) {
    this.keys.push(new paramikojs.AgentKey(this, msg.result.get_string()));
    msg.result.get_string();
  }
}

paramikojs.Agent.SSH2_AGENTC_REQUEST_IDENTITIES = 11;
paramikojs.Agent.SSH2_AGENT_IDENTITIES_ANSWER = 12;
paramikojs.Agent.SSH2_AGENTC_SIGN_REQUEST = 13;
paramikojs.Agent.SSH2_AGENT_SIGN_RESPONSE = 14;

paramikojs.Agent.prototype = {

  /*
    Close the SSH agent connection.
  */
  close : function() {
    if (this.conn) {
      this.conn.close();
    }
    this.conn = null;
    this.keys = [];
  },

  /*
    Return the list of keys available through the SSH agent, if any.  If
    no SSH agent was running (or it couldn't be contacted), an empty list
    will be returned.

    @return: a list of keys available on the SSH agent
    @rtype: tuple of L{AgentKey}
  */
  get_keys : function() {
    return this.keys;
  },

  _send_message : function(msg) {
    var msg = msg.toString();
    this.conn.send(struct.pack('>I', msg.length) + msg);  // TODO, fixme
    var l = this._read_all(4);
    msg = new paramikojs.Message(this._read_all(struct.unpack('>I', l)[0]));
    return { 'ptype': msg.get_byte().charCodeAt(0), 'result': msg };
  },

  _read_all : function(wanted) {
    var result = this.conn.recv(wanted);  // TODO, fixme
    while (result.length < wanted) {
      if (result.length == 0) {
        throw new paramikojs.ssh_exception.SSHException('lost ssh-agent');
      }
      var extra = this.conn.recv(wanted - result.length);
      if (extra.length == 0) {
        throw new paramikojs.ssh_exception.SSHException('lost ssh-agent');
      }
      result += extra;
    }
    return result;
  }
};



/*
  Private key held in a local SSH agent.  This type of key can be used for
  authenticating to a remote server (signing).  Most other key operations
  work as expected.
 */
paramikojs.AgentKey = function(agent, blob) {
	inherit(this, new paramikojs.PKey());

  this.agent = agent;
  this.blob = blob;
  this.name = new paramikojs.Message(blob).get_string();
}

paramikojs.AgentKey.prototype = {
	toString : function() {
    return this.blob;
  },

	get_name : function() {
    return this.name;
  },

	sign_ssh_data : function(rng, data, callback) {
    var msg = new paramikojs.Message();
    msg.add_byte(String.fromCharCode(paramikojs.Agent.SSH2_AGENTC_SIGN_REQUEST));
    msg.add_string(this.blob);
    msg.add_string(data);
    msg.add_int(0);
    var msg = this.agent._send_message(msg);
    if (msg.ptype != paramikojs.Agent.SSH2_AGENT_SIGN_RESPONSE) {
      throw new paramikojs.ssh_exception.SSHException('key cannot be used for signing');
    }
    callback(msg.result.get_string());
  }
};

// Source: auth_handler.js
/*
  Internal class to handle the mechanics of authentication.
*/
paramikojs.AuthHandler = function(transport) {
  this.transport = transport;
  this.username = null;
  this.authenticated = false;
  this.auth_method = '';
  this.password = null;
  this.private_key = null;
  this.interactive_handler = null;
  this.submethods = null;
  // for server mode:
  this.auth_username = null;
  this.auth_fail_count = 0;
  this.callback = null;

  this.triedKeyboard = false;
  this.triedPublicKey = false;
};

paramikojs.AuthHandler.prototype = {
  is_authenticated : function() {
    return this.authenticated;
  },

  get_username : function() {
    if (this.transport.server_mode) {
      return this.auth_username;
    } else {
      return this.username;
    }
  },

  auth_none : function(username) {
    this.auth_method = 'none';
    this.username = username;
    this._request_auth();
  },

  auth_publickey : function(username, key) {
    this.auth_method = 'publickey';
    this.username = username;
    this.private_key = key;
    this.triedPublicKey = true;
    this._request_auth();
  },

  auth_password : function(username, password) {
    this.auth_method = 'password';
    this.username = username;
    this.password = password;
    this._request_auth();
  },

  /*
    response_list = handler(title, instructions, prompt_list)
  */
  auth_interactive : function(username, handler, submethods) {
    this.auth_method = 'keyboard-interactive';
    this.username = username;
    this.interactive_handler = handler;
    this.submethods = submethods || '';
    this.triedKeyboard = true;
    this._request_auth();
  },

  abort : function() {

  },


  // internals...


  _request_auth : function(self) {
    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_SERVICE_REQUEST));
    m.add_string('ssh-userauth');
    this.transport._send_message(m);
  },

  _disconnect_service_not_available : function() {
    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_DISCONNECT));
    m.add_int(paramikojs.DISCONNECT_SERVICE_NOT_AVAILABLE);
    m.add_string('Service not available');
    m.add_string('en');
    this.transport._send_message(m);
    this.transport.close();
  },

  _disconnect_no_more_auth : function() {
    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_DISCONNECT));
    m.add_int(paramikojs.DISCONNECT_NO_MORE_AUTH_METHODS_AVAILABLE);
    m.add_string('No more auth methods available');
    m.add_string('en');
    this.transport._send_message(m);
    this.transport.close();
  },

  _get_session_blob : function(key, service, username) {
    var m = new paramikojs.Message();
    m.add_string(this.transport.session_id);
    m.add_byte(String.fromCharCode(paramikojs.MSG_USERAUTH_REQUEST));
    m.add_string(username);
    m.add_string(service);
    m.add_string('publickey');
    m.add_boolean(1);
    m.add_string(key.get_name());
    m.add_string(key.toString());
    return m.toString();
  },

  wait_for_response : function() {
    return; // do nothing
  },

  _parse_service_request : function(m) {
    var service = m.get_string();
    if (this.transport.server_mode && service == 'ssh-userauth') {
        // accepted
        var m = new paramikojs.Message();
        m.add_byte(String.fromCharCode(paramikojs.MSG_SERVICE_ACCEPT));
        m.add_string(service);
        this.transport._send_message(m);
        return;
    }
    // dunno this one
    this._disconnect_service_not_available();
  },

  _parse_service_accept : function(m) {
    var service = m.get_string();
    if (service == 'ssh-userauth') {
      if(ssh_console.debug) console.debug('userauth is OK');
      var m = new paramikojs.Message();
      m.add_byte(String.fromCharCode(paramikojs.MSG_USERAUTH_REQUEST));
      m.add_string(this.username);
      m.add_string('ssh-connection');
      m.add_string(this.auth_method);
      if (this.auth_method == 'password') {
        m.add_boolean(false);
        var password = this.password;
        try {
          password = this.transport.toUTF8.convertStringToUTF8(password, "UTF-8", 1);
        } catch(ex) {
          if(ssh_console.debug) console.debug(ex);
        }
        m.add_string(password);
      } else if (this.auth_method == 'publickey') {
        m.add_boolean(true);
        m.add_string(this.private_key.get_name());
        m.add_string(this.private_key.toString());
        var blob = this._get_session_blob(this.private_key, 'ssh-connection', this.username);

        var self = this;
        var callback = function(sig) {
          m.add_string(sig.toString());
          self.transport._send_message(m);
        };
        this.private_key.sign_ssh_data(this.transport.rng, blob, callback); // mime: changed to support workers
        return;
      } else if (this.auth_method == 'keyboard-interactive') {
        m.add_string('');
        m.add_string(this.submethods);
      } else if (this.auth_method == 'none') {
        // do nothing
      } else {
        throw new paramikojs.ssh_exception.SSHException('Unknown auth method "' + this.auth_method + '"');
      }
      this.transport._send_message(m);
    } else {
      if(ssh_console.debug) console.debug('Service request "' + service + '" accepted (?)');
    }
  },

  _send_auth_result : function(username, method, result) {
    // okay, send result
    var m = new paramikojs.Message();
    if (result == paramikojs.AUTH_SUCCESSFUL) {
      if(ssh_console.info) console.info('Auth granted (' + method + ').');
      m.add_byte(String.fromCharCode(paramikojs.MSG_USERAUTH_SUCCESS));
      this.authenticated = true;
    } else {
      if(ssh_console.info) console.info('Auth rejected (' + method + ').');
      m.add_byte(String.fromCharCode(paramikojs.MSG_USERAUTH_FAILURE));
      m.add_string(this.transport.server_object.get_allowed_auths(username));
      if (result == paramikojs.AUTH_PARTIALLY_SUCCESSFUL) {
        m.add_boolean(1);
      } else {
        m.add_boolean(0);
        this.auth_fail_count += 1;
      }
    }
    this.transport._send_message(m);
    if (this.auth_fail_count >= 10) {
      this._disconnect_no_more_auth();
    }
    if (result == paramikojs.AUTH_SUCCESSFUL) {
      this.transport._auth_trigger();
    }
  },

  _interactive_query : function(q) {
    // make interactive query instead of response
    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_USERAUTH_INFO_REQUEST));
    m.add_string(q.name);
    m.add_string(q.instructions);
    m.add_string('');
    m.add_int(q.prompts.length);
    for (var x = 0; x < q.prompts.length; ++x) {
      m.add_string(q.prompts[x][0]);
      m.add_boolean(q.prompts[x][1]);
    }
    this.transport._send_message(m);
  },

  _parse_userauth_request : function(m) {
    if (!this.transport.server_mode) {
        // er, uh... what?
        m = new paramikojs.Message();
        m.add_byte(String.fromCharCode(paramikojs.MSG_USERAUTH_FAILURE));
        m.add_string('none');
        m.add_boolean(0);
        this.transport._send_message(m);
        return;
    }
    if (this.authenticated) {
      // ignore
      return;
    }
    var username = m.get_string();
    var service = m.get_string();
    var method = m.get_string();
    if(ssh_console.debug) console.debug('Auth request (type=' + method + ') service=' + service + ', username=' + username);
    if (service != 'ssh-connection') {
      this._disconnect_service_not_available();
      return;
    }
    if (this.auth_username && this.auth_username != username) {
      if(ssh_console.info) console.info('Auth rejected because the client attempted to change username in mid-flight');
      this._disconnect_no_more_auth();
      return;
    }
    this.auth_username = username;

    var result;
    if (method == 'none') {
      result = this.transport.server_object.check_auth_none(username);
    } else if (method == 'password') {
      var changereq = m.get_boolean();
      var password = m.get_string();
      password = this.transport.fromUTF8.ConvertFromUnicode(password) + this.transport.fromUTF8.Finish();

      if (changereq) {
        // always treated as failure, since we don't support changing passwords, but collect
        // the list of valid auth types from the callback anyway
        if(ssh_console.debug) console.debug('Auth request to change passwords (rejected)');
        var newpassword = m.get_string();
        newpassword = this.transport.fromUTF8.ConvertFromUnicode(newpassword) + this.transport.fromUTF8.Finish();
        result = paramikojs.AUTH_FAILED;
      } else {
        result = this.transport.server_object.check_auth_password(username, password);
      }
    } else if (method == 'publickey') {
      var sig_attached = m.get_boolean();
      var keytype = m.get_string();
      var keyblob = m.get_string();
      try {
        key = this.transport._key_info[keytype](new paramikojs.Message(keyblob));
      } catch(ex) {
        if(ssh_console.info) console.info('Auth rejected: public key: ' + ex.toString());
        key = null;
      }
      if (!key) {
        this._disconnect_no_more_auth();
        return;
      }
      // first check if this key is okay... if not, we can skip the verify
      result = this.transport.server_object.check_auth_publickey(username, key);
      if (result != paramikojs.AUTH_FAILED) {
        // key is okay, verify it
        if (!sig_attached) {
          // client wants to know if this key is acceptable, before it
          // signs anything...  send special "ok" message
          m = new paramikojs.Message();
          m.add_byte(String.fromCharCode(paramikojs.MSG_USERAUTH_PK_OK));
          m.add_string(keytype);
          m.add_string(keyblob);
          this.transport._send_message(m);
          return;
        }
        var sig = new paramikojs.Message(m.get_string());
        var blob = this._get_session_blob(key, service, username);
        if (!key.verify_ssh_sig(blob, sig)) {
          if(ssh_console.info) console.info('Auth rejected: invalid signature');
          result = paramikojs.AUTH_FAILED;
        }
      }
    } else if (method == 'keyboard-interactive') {
      var lang = m.get_string();
      var submethods = m.get_string();
      result = this.transport.server_object.check_auth_interactive(username, submethods);
      if (result instanceof paramikojs.InteractiveQuery) {
        // make interactive query instead of response
        this._interactive_query(result);
        return;
      }
    } else {
      result = this.transport.server_object.check_auth_none(username);
    }
    // okay, send result
    this._send_auth_result(username, method, result);
  },

  _parse_userauth_success : function(m) {
    if(ssh_console.info) console.info('Authentication (' + this.auth_method + ') successful!');
    this.authenticated = true;
    this.transport._auth_trigger();
    this.transport.auth_callback(true);
  },

  _parse_userauth_failure : function(m) {
    var authlist = m.get_list();
    var partial = m.get_boolean();
    var nextOptions = null;
    if (partial) {
      if(ssh_console.info) console.info('Authentication continues...');
      if(ssh_console.debug) console.debug('Methods: ' + authlist.toString());
      //this.transport.saved_exception = new paramikojs.ssh_exception.PartialAuthentication(authlist);
      nextOptions = authlist;
    } else if (authlist.indexOf(this.auth_method) == -1) {
      if(ssh_console.debug) console.debug('Authentication type (' + this.auth_method + ') not permitted.');
      if(ssh_console.debug) console.debug('Allowed methods: ' + authlist.toString());
      //this.transport.saved_exception = new paramikojs.ssh_exception.BadAuthenticationType('Bad authentication type', authlist);
      nextOptions = authlist;
    } else {
      if(ssh_console.info) console.info('Authentication (' + this.auth_method + ') failed.');
    }
    this.authenticated = false;
    this.username = null;
    this.transport.auth_callback(false, authlist, this.triedKeyboard, this.triedPublicKey);
  },

  _parse_userauth_banner : function(m) {
    var banner = m.get_string();
    var lang = m.get_string();
    if(ssh_console.info) console.info('Auth banner: ' + banner);
    // who cares.
  },

  _parse_userauth_info_request : function(m) {
    if (this.auth_method != 'keyboard-interactive') {
      throw new paramikojs.ssh_exception.SSHException('Illegal info request from server');
    }
    var title = m.get_string();
    var instructions = m.get_string();
    m.get_string();  // lang
    var prompts = m.get_int();
    var prompt_list = [];
    for (var x = 0; x < prompts; ++x) {
      prompt_list.push([m.get_string(), m.get_boolean()]);
    }
    var response_list = this.interactive_handler(title, instructions, prompt_list);

    m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_USERAUTH_INFO_RESPONSE));
    m.add_int(response_list.length);
    for (var x = 0; x < response_list.length; ++x) {
      m.add_string(response_list[x]);
    }
    this.transport._send_message(m);
  },

  _parse_userauth_info_response : function(m) {
    if (!this.transport.server_mode) {
      throw new paramikojs.ssh_exception.SSHException('Illegal info response from server');
    }
    var n = m.get_int();
    var responses = [];
    for (var x = 0; x < n; ++x) {
      responses.append(m.get_string());
    }
    var result = this.transport.server_object.check_auth_interactive_response(responses);
    if (result instanceof paramikojs.InteractiveQuery) {
      // make interactive query instead of response
      this._interactive_query(result);
      return;
    }
    this._send_auth_result(this.auth_username, 'keyboard-interactive', result);
  },

  _handler_table : {
    5: function(self, m) { self._parse_service_request(m); },
    6: function(self, m) { self._parse_service_accept(m); },
    50: function(self, m) { self._parse_userauth_request(m); },
    51: function(self, m) { self._parse_userauth_failure(m); },
    52: function(self, m) { self._parse_userauth_success(m); },
    53: function(self, m) { self._parse_userauth_banner(m); },
    60: function(self, m) { self._parse_userauth_info_request(m); },
    61: function(self, m) { self._parse_userauth_info_response(m); }
  }
};

// Source: ber.js
paramikojs.BER = function (content) {
	this.content = content;
  this.idx = 0;
};

paramikojs.BER.prototype = {
	toString : function() {
    return this.content;
  },

  decode : function() {
    return this.decode_next();
  },

  decode_next : function() {
    if (this.idx >= this.content.length) {
      return null;
    }
    var ident = this.content[this.idx].charCodeAt(0);
    var t;
    this.idx += 1;
    if ((ident & 31) == 31) {
      // identifier > 30
      ident = 0;
      while (this.idx < this.content.length) {
        t = this.content[this.idx].charCodeAt(0);
        this.idx += 1;
        ident = (ident << 7) | (t & 0x7f);
        if (!(t & 0x80)) {
          break;
        }
      }
    }
    if (this.idx >= this.content.length) {
      return null;
    }
    // now fetch length
    var size = this.content[this.idx].charCodeAt(0);
    this.idx += 1;
    if (size & 0x80) {
      // more complimicated...
      // FIXME: theoretically should handle indefinite-length (0x80)
      t = size & 0x7f;
      if (this.idx + t > this.content.length) {
        return null;
      }
      size = paramikojs.util.inflate_long(this.content.substring(this.idx, this.idx + t), true).intValue();
      this.idx += t;
    }
    if (this.idx + size > this.content.length) {
      // can't fit
      return null;
    }
    var data = this.content.substring(this.idx, this.idx + size);
    this.idx += size;
    // now switch on id
    if (ident == 0x30) {
      // sequence
      return this.decode_sequence(data);
    } else if (ident == 2) {
      // int
      return paramikojs.util.inflate_long(data);
    } else {
      // 1: boolean (00 false, otherwise true)
      throw new paramikojs.ssh_exception.BERException('Unknown ber encoding type ' + ident + ' (robey is lazy)');
    }
  },

  decode_sequence : function(data) {
    var out = [];
    var b = new paramikojs.BER(data);
    while (true) {
      var x = b.decode_next();
      if (!x) {
        break;
      }
      out.push(x);
    }
    return out;
  },

  encode_tlv : function(ident, val) {
    // no need to support ident > 31 here
    this.content += String.fromCharCode(ident);
    if (val.length > 0x7f) {
      var lenstr = paramikojs.util.deflate_long(val.length);
      this.content += String.fromCharCode(0x80 + lenstr.length) + lenstr;
    } else {
      this.content += String.fromCharCode(val.length);
    }
    this.content += val;
  },

  encode : function(x) {
    if (typeof x == "boolean") {
      if (x) {
        this.encode_tlv(1, '\xff');
      } else {
        this.encode_tlv(1, '\x00');
      }
    } else if (typeof x == "number") {
      this.encode_tlv(2, paramikojs.util.deflate_long(x));
    } else if (typeof x == "string") {
      this.encode_tlv(4, x);
    } else if (x instanceof Array) {
      this.encode_tlv(0x30, this.encode_sequence(x));
    } else {
      throw new paramikojs.ssh_exception.BERException('Unknown type for encoding: ' + typeof x);
    }
  },

  encode_sequence : function(data) {
    var b = new paramikojs.BER();
    for (var x = 0; x < data.length; ++x) {
      b.encode(data[x]);
    }
    return str(b);
  }
};

// Source: channel.js
/*
  A secure tunnel across an SSH L{Transport}.  A Channel is meant to behave
  like a socket, and has an API that should be indistinguishable from the
  python socket API.

  Because SSH2 has a windowing kind of flow control, if you stop reading data
  from a Channel and its buffer fills up, the server will be unable to send
  you any more data until you read some of it.  (This won't affect other
  channels on the same transport -- all channels on a single transport are
  flow-controlled independently.)  Similarly, if the server isn't reading
  data you send, calls to L{send} may block, unless you set a timeout.  This
  is exactly like a normal network socket, so it shouldn't be too surprising.
*/
paramikojs.Channel = function (chanid) {
  /*
    Create a new channel.  The channel is not associated with any
    particular session or L{Transport} until the Transport attaches it.
    Normally you would only call this method from the constructor of a
    subclass of L{Channel}.

    @param chanid: the ID of this channel, as passed by an existing
        L{Transport}.
    @type chanid: int
  */

  this.chanid = chanid;
  this.remote_chanid = 0;
  this.transport = null;
  this.active = false;
  this.eof_received = 0;
  this.eof_sent = 0;
  this.in_buffer = "";
  this.in_stderr_buffer = "";
  this.timeout = null;
  this.closed = false;
  this.ultra_debug = false;
  this.in_window_size = 0;
  this.out_window_size = 0;
  this.in_max_packet_size = 0;
  this.out_max_packet_size = 0;
  this.in_window_threshold = 0;
  this.in_window_sofar = 0;
  this._name = chanid.toString();
  //this.logger = paramikojs.util.get_logger();
  this._pipe = null;
  this.event_ready = false;
  this.combine_stderr = false;
  this.exit_status = -1;
  this.origin_addr = null;
};

// lower bound on the max packet size we'll accept from the remote host
paramikojs.Channel.MIN_PACKET_SIZE = 1024;

paramikojs.Channel.prototype = {
  /*
    Request a pseudo-terminal from the server.  This is usually used right
    after creating a client channel, to ask the server to provide some
    basic terminal semantics for a shell invoked with L{invoke_shell}.
    It isn't necessary (or desirable) to call this method if you're going
    to exectue a single command with L{exec_command}.

    @param term: the terminal type to emulate (for example, C{'vt100'})
    @type term: str
    @param width: width (in characters) of the terminal screen
    @type width: int
    @param height: height (in characters) of the terminal screen
    @type height: int

    @raise SSHException: if the request was rejected or the channel was
        closed
  */
  get_pty : function(term, width, height) {
    if (this.closed || this.eof_received || this.eof_sent || !this.active) {
      throw new paramikojs.ssh_exception.SSHException('Channel is not open');
    }
    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_CHANNEL_REQUEST));
    m.add_int(this.remote_chanid);
    m.add_string('pty-req');
    m.add_boolean(true);
    m.add_string(term || 'vt100');
    m.add_int(width || 80);
    m.add_int(height || 24);
    // pixel height, width (usually useless)
    m.add_int(0).add_int(0);
    m.add_string('');
    this.transport._send_user_message(m);
  },

  /*
    Request an interactive shell session on this channel.  If the server
    allows it, the channel will then be directly connected to the stdin,
    stdout, and stderr of the shell.

    Normally you would call L{get_pty} before this, in which case the
    shell will operate through the pty, and the channel will be connected
    to the stdin and stdout of the pty.

    When the shell exits, the channel will be closed and can't be reused.
    You must open a new channel if you wish to open another shell.

    @raise SSHException: if the request was rejected or the channel was
        closed
  */
  invoke_shell : function() {
    if (this.closed || this.eof_received || this.eof_sent || !this.active) {
      throw new paramikojs.ssh_exception.SSHException('Channel is not open');
    }
    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_CHANNEL_REQUEST));
    m.add_int(this.remote_chanid);
    m.add_string('shell');
    m.add_boolean(1);
    this.transport._send_user_message(m);
  },

  /*
    Execute a command on the server.  If the server allows it, the channel
    will then be directly connected to the stdin, stdout, and stderr of
    the command being executed.

    When the command finishes executing, the channel will be closed and
    can't be reused.  You must open a new channel if you wish to execute
    another command.

    @param command: a shell command to execute.
    @type command: str

    @raise SSHException: if the request was rejected or the channel was
        closed
  */
  exec_command : function(command) {
    if (this.closed || this.eof_received || this.eof_sent || !this.active) {
      throw new paramikojs.ssh_exception.SSHException('Channel is not open');
    }
    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_CHANNEL_REQUEST));
    m.add_int(this.remote_chanid);
    m.add_string('exec');
    m.add_boolean(true);
    m.add_string(command);
    this.transport._send_user_message(m);
  },

  /*
    Request a subsystem on the server (for example, C{sftp}).  If the
    server allows it, the channel will then be directly connected to the
    requested subsystem.

    When the subsystem finishes, the channel will be closed and can't be
    reused.

    @param subsystem: name of the subsystem being requested.
    @type subsystem: str

    @raise SSHException: if the request was rejected or the channel was
        closed
  */
  invoke_subsystem : function(subsystem) {
    if (this.closed || this.eof_received || this.eof_sent || !this.active) {
      throw new paramikojs.ssh_exception.SSHException('Channel is not open');
    }
    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_CHANNEL_REQUEST));
    m.add_int(this.remote_chanid);
    m.add_string('subsystem');
    m.add_boolean(true);
    m.add_string(subsystem);
    this.transport._send_user_message(m);
  },

  /*
    Resize the pseudo-terminal.  This can be used to change the width and
    height of the terminal emulation created in a previous L{get_pty} call.

    @param width: new width (in characters) of the terminal screen
    @type width: int
    @param height: new height (in characters) of the terminal screen
    @type height: int

    @raise SSHException: if the request was rejected or the channel was
        closed
  */
  resize_pty : function(width, height) {
    if (this.closed || this.eof_received || this.eof_sent || !this.active){
      throw new paramikojs.ssh_exception.SSHException('Channel is not open');
    }
    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_CHANNEL_REQUEST));
    m.add_int(this.remote_chanid);
    m.add_string('window-change');
    m.add_boolean(true);
    m.add_int(width || 80);
    m.add_int(height || 24);
    m.add_int(0).add_int(0);
    this.transport._send_user_message(m);
  },

  /*
    Return true if the remote process has exited and returned an exit
    status. You may use this to poll the process status if you don't
    want to block in L{recv_exit_status}. Note that the server may not
    return an exit status in some cases (like bad servers).

    @return: True if L{recv_exit_status} will return immediately
    @rtype: bool
    @since: 1.7.3
  */
  exit_status_ready : function() {
    return this.closed;
  },

  /*
    Return the exit status from the process on the server.  This is
    mostly useful for retrieving the results of an L{exec_command}.
    If the command hasn't finished yet, this method will wait until
    it does, or until the channel is closed.  If no exit status is
    provided by the server, -1 is returned.

    @return: the exit code of the process on the server.
    @rtype: int

    @since: 1.2
  */
  recv_exit_status : function() {
    return this.exit_status;
  },

  /*
    Send the exit status of an executed command to the client.  (This
    really only makes sense in server mode.)  Many clients expect to
    get some sort of status code back from an executed command after
    it completes.

    @param status: the exit code of the process
    @type status: int

    @since: 1.2
  */
  send_exit_status : function(status) {
    // in many cases, the channel will not still be open here.
    // that's fine.
    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_CHANNEL_REQUEST));
    m.add_int(this.remote_chanid);
    m.add_string('exit-status');
    m.add_boolean(false);
    m.add_int(status);
    this.transport._send_user_message(m);
  },

  /*
    Request an x11 session on this channel.  If the server allows it,
    further x11 requests can be made from the server to the client,
    when an x11 application is run in a shell session.

    From RFC4254::

        It is RECOMMENDED that the 'x11 authentication cookie' that is
        sent be a fake, random cookie, and that the cookie be checked and
        replaced by the real cookie when a connection request is received.

    If you omit the auth_cookie, a new secure random 128-bit value will be
    generated, used, and returned.  You will need to use this value to
    verify incoming x11 requests and replace them with the actual local
    x11 cookie (which requires some knoweldge of the x11 protocol).

    If a handler is passed in, the handler is called from another thread
    whenever a new x11 connection arrives.  The default handler queues up
    incoming x11 connections, which may be retrieved using
    L{Transport.accept}.  The handler's calling signature is::

        handler(channel: Channel, (address: str, port: int))

    @param screen_number: the x11 screen number (0, 10, etc)
    @type screen_number: int
    @param auth_protocol: the name of the X11 authentication method used;
        if none is given, C{"MIT-MAGIC-COOKIE-1"} is used
    @type auth_protocol: str
    @param auth_cookie: hexadecimal string containing the x11 auth cookie;
        if none is given, a secure random 128-bit value is generated
    @type auth_cookie: str
    @param single_connection: if True, only a single x11 connection will be
        forwarded (by default, any number of x11 connections can arrive
        over this session)
    @type single_connection: bool
    @param handler: an optional handler to use for incoming X11 connections
    @type handler: function
    @return: the auth_cookie used
  */
  request_x11 : function(screen_number, auth_protocol, auth_cookie, single_connection, handler) {
    if (this.closed || this.eof_received || this.eof_sent || !this.active) {
      throw new paramikojs.ssh_exception.SSHException('Channel is not open');
    }
    if (!auth_protocol) {
      auth_protocol = 'MIT-MAGIC-COOKIE-1';
    }
    if (!auth_cookie) {
      auth_cookie = binascii.hexlify(this.transport.rng.read(16));
    }

    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_CHANNEL_REQUEST));
    m.add_int(this.remote_chanid);
    m.add_string('x11-req');
    m.add_boolean(true);
    m.add_boolean(single_connection);
    m.add_string(auth_protocol);
    m.add_string(auth_cookie);
    m.add_int(screen_number || 0);
    this.transport._send_user_message(m);
    this.transport._set_x11_handler(handler);
    return auth_cookie;
  },

  /*
    Return the L{Transport} associated with this channel.

    @return: the L{Transport} that was used to create this channel.
    @rtype: L{Transport}
  */
  get_transport : function() {
    return this.transport;
  },

  /*
    Set a name for this channel.  Currently it's only used to set the name
    of the channel in logfile entries.  The name can be fetched with the
    L{get_name} method.

    @param name: new channel name
    @type name: str
  */
  set_name : function(name) {
    this._name = name;
  },

  /*
    Get the name of this channel that was previously set by L{set_name}.

    @return: the name of this channel.
    @rtype: str
  */
  get_name : function() {
    return this._name;
  },

  /*
    Return the ID # for this channel.  The channel ID is unique across
    a L{Transport} and usually a small number.  It's also the number
    passed to L{ServerInterface.check_channel_request} when determining
    whether to accept a channel request in server mode.

    @return: the ID of this channel.
    @rtype: int
  */
  get_id : function() {
    return this.chanid;
  },

  /*
    Set whether stderr should be combined into stdout on this channel.
    The default is C{False}, but in some cases it may be convenient to
    have both streams combined.

    If this is C{False}, and L{exec_command} is called (or C{invoke_shell}
    with no pty), output to stderr will not show up through the L{recv}
    and L{recv_ready} calls.  You will have to use L{recv_stderr} and
    L{recv_stderr_ready} to get stderr output.

    If this is C{True}, data will never show up via L{recv_stderr} or
    L{recv_stderr_ready}.

    @param combine: C{True} if stderr output should be combined into
        stdout on this channel.
    @type combine: bool
    @return: previous setting.
    @rtype: bool

    @since: 1.1
  */
  set_combine_stderr : function(combine) {
    var data = '';

    var old = this.combine_stderr;
    this.combine_stderr = combine;
    if (combine && !old) {
      // copy old stderr buffer into primary buffer
      data = this.in_stderr_buffer;
      this.in_stderr_buffer = "";
    }
    if (data.length > 0) {
      this._feed(data);
    }
    return old;
  },


  // socket API


  /*
    Set a timeout on blocking read/write operations.  The C{timeout}
    argument can be a nonnegative float expressing seconds, or C{None}.  If
    a float is given, subsequent channel read/write operations will raise
    a timeout exception if the timeout period value has elapsed before the
    operation has completed.  Setting a timeout of C{None} disables
    timeouts on socket operations.

    C{chan.settimeout(0.0)} is equivalent to C{chan.setblocking(0)};
    C{chan.settimeout(None)} is equivalent to C{chan.setblocking(1)}.

    @param timeout: seconds to wait for a pending read/write operation
        before raising C{socket.timeout}, or C{None} for no timeout.
    @type timeout: float
  */
  settimeout : function(timeout) {
    this.timeout = timeout;
  },

  /*
    Returns the timeout in seconds (as a float) associated with socket
    operations, or C{None} if no timeout is set.  This reflects the last
    call to L{setblocking} or L{settimeout}.

    @return: timeout in seconds, or C{None}.
    @rtype: float
  */
  gettimeout : function() {
    return this.timeout;
  },

  /*
    Set blocking or non-blocking mode of the channel: if C{blocking} is 0,
    the channel is set to non-blocking mode; otherwise it's set to blocking
    mode. Initially all channels are in blocking mode.

    In non-blocking mode, if a L{recv} call doesn't find any data, or if a
    L{send} call can't immediately dispose of the data, an error exception
    is raised. In blocking mode, the calls block until they can proceed. An
    EOF condition is considered "immediate data" for L{recv}, so if the
    channel is closed in the read direction, it will never block.

    C{chan.setblocking(0)} is equivalent to C{chan.settimeout(0)};
    C{chan.setblocking(1)} is equivalent to C{chan.settimeout(None)}.

    @param blocking: 0 to set non-blocking mode; non-0 to set blocking
        mode.
    @type blocking: int
  */
  setblocking : function(blocking) {
    if (blocking) {
      this.settimeout(null);
    } else {
      this.settimeout(0.0);
    }
  },

  /*
    Return the address of the remote side of this Channel, if possible.
    This is just a wrapper around C{'getpeername'} on the Transport, used
    to provide enough of a socket-like interface to allow asyncore to work.
    (asyncore likes to call C{'getpeername'}.)

    @return: the address if the remote host, if known
    @rtype: tuple(str, int)
  */
  getpeername : function() {
    return this.transport.getpeername();
  },

  /*
    Close the channel.  All future read/write operations on the channel
    will fail.  The remote end will receive no more data (after queued data
    is flushed).  Channels are automatically closed when their L{Transport}
    is closed or when they are garbage collected.
  */
  close : function() {
    // only close the pipe when the user explicitly closes the channel.
    // otherwise they will get unpleasant surprises.  (and do it before
    // checking self.closed, since the remote host may have already
    // closed the connection.)
    if (this._pipe) {
      this._pipe.close();
      this._pipe = null;
    }

    if (!this.active || this.closed) {
      return;
    }
    var msgs = this._close_internal();
    for (var x = 0; x < msgs.length; ++x) {
      if (msgs[x]) {
        this.transport._send_user_message(msgs[x]);
      }
    }
  },

  /*
    Returns true if data is buffered and ready to be read from this
    channel.  A C{False} result does not mean that the channel has closed;
    it means you may need to wait before more data arrives.

    @return: C{True} if a L{recv} call on this channel would immediately
        return at least one byte; C{False} otherwise.
    @rtype: boolean
  */
  recv_ready : function() {
    return this.in_buffer.length != 0;
  },

  /*
    Receive data from the channel.  The return value is a string
    representing the data received.  The maximum amount of data to be
    received at once is specified by C{nbytes}.  If a string of length zero
    is returned, the channel stream has closed.

    @param nbytes: maximum number of bytes to read.
    @type nbytes: int
    @return: data.
    @rtype: str

    @raise socket.timeout: if no data is ready before the timeout set by
        L{settimeout}.
  */
  recv : function(nbytes) {
    if (!this.in_buffer.length) {
      throw new paramikojs.ssh_exception.WaitException("wait");
    }
    var out = this.in_buffer.substring(0, nbytes);
    this.in_buffer = this.in_buffer.substring(nbytes);

    var ack = this._check_add_window(out.length);
    // no need to hold the channel lock when sending this
    if (ack > 0) {
      var m = new paramikojs.Message();
      m.add_byte(String.fromCharCode(paramikojs.MSG_CHANNEL_WINDOW_ADJUST));
      m.add_int(this.remote_chanid);
      m.add_int(ack);
      this.transport._send_user_message(m);
    }

    return out;
  },

  /*
    Returns true if data is buffered and ready to be read from this
    channel's stderr stream.  Only channels using L{exec_command} or
    L{invoke_shell} without a pty will ever have data on the stderr
    stream.

    @return: C{True} if a L{recv_stderr} call on this channel would
        immediately return at least one byte; C{False} otherwise.
    @rtype: boolean

    @since: 1.1
  */
  recv_stderr_ready : function() {
    return true; //this.in_stderr_buffer.read_ready();
  },

  /*
    Receive data from the channel's stderr stream.  Only channels using
    L{exec_command} or L{invoke_shell} without a pty will ever have data
    on the stderr stream.  The return value is a string representing the
    data received.  The maximum amount of data to be received at once is
    specified by C{nbytes}.  If a string of length zero is returned, the
    channel stream has closed.

    @param nbytes: maximum number of bytes to read.
    @type nbytes: int
    @return: data.
    @rtype: str

    @raise socket.timeout: if no data is ready before the timeout set by
        L{settimeout}.

    @since: 1.1
  */
  recv_stderr : function(nbytes) {
    if (!this.in_stderr_buffer.length) {
      throw new paramikojs.ssh_exception.WaitException("wait");
    }
    var out = this.in_stderr_buffer.substring(0, nbytes);
    this.in_stderr_buffer = this.in_stderr_buffer.substring(nbytes);

    var ack = this._check_add_window(out.length);
    // no need to hold the channel lock when sending this
    if (ack > 0) {
      var m = new paramikojs.Message();
      m.add_byte(String.fromCharCode(paramikojs.MSG_CHANNEL_WINDOW_ADJUST));
      m.add_int(this.remote_chanid);
      m.add_int(ack);
      this.transport._send_user_message(m);
    }

    return out;
  },

  /*
    Returns true if data can be written to this channel without blocking.
    This means the channel is either closed (so any write attempt would
    return immediately) or there is at least one byte of space in the
    outbound buffer. If there is at least one byte of space in the
    outbound buffer, a L{send} call will succeed immediately and return
    the number of bytes actually written.

    @return: C{True} if a L{send} call on this channel would immediately
        succeed or fail
    @rtype: boolean
  */
  send_ready : function() {
    if (this.closed || this.eof_sent) {
      return true;
    }
    return this.out_window_size > 0;
  },

  /*
    Send data to the channel.  Returns the number of bytes sent, or 0 if
    the channel stream is closed.  Applications are responsible for
    checking that all data has been sent: if only some of the data was
    transmitted, the application needs to attempt delivery of the remaining
    data.

    @param s: data to send
    @type s: str
    @return: number of bytes actually sent
    @rtype: int

    @raise socket.timeout: if no data could be sent before the timeout set
        by L{settimeout}.
  */
  send : function(s) {
    var size = s.length;
    size = this._wait_for_send_window(size);
    if (size == 0) {
      // eof or similar
      return 0;
    }
    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_CHANNEL_DATA));
    m.add_int(this.remote_chanid);
    m.add_string(s.substring(0, size));
    this.transport._send_user_message(m);
    return size;
  },

  /*
    Send data to the channel on the "stderr" stream.  This is normally
    only used by servers to send output from shell commands -- clients
    won't use this.  Returns the number of bytes sent, or 0 if the channel
    stream is closed.  Applications are responsible for checking that all
    data has been sent: if only some of the data was transmitted, the
    application needs to attempt delivery of the remaining data.

    @param s: data to send.
    @type s: str
    @return: number of bytes actually sent.
    @rtype: int

    @raise socket.timeout: if no data could be sent before the timeout set
        by L{settimeout}.

    @since: 1.1
  */
  send_stderr : function(s) {
    var size = s.length;
    size = this._wait_for_send_window(size);
    if (size == 0) {
      // eof or similar
      return 0;
    }
    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_CHANNEL_EXTENDED_DATA));
    m.add_int(this.remote_chanid);
    m.add_int(1);
    m.add_string(s.substring(0, size));
    this.transport._send_user_message(m);
    return size;
  },

  /*
    Send data to the channel, without allowing partial results.  Unlike
    L{send}, this method continues to send data from the given string until
    either all data has been sent or an error occurs.  Nothing is returned.

    @param s: data to send.
    @type s: str

    @raise socket.timeout: if sending stalled for longer than the timeout
        set by L{settimeout}.
    @raise socket.error: if an error occured before the entire string was
        sent.

    @note: If the channel is closed while only part of the data hase been
        sent, there is no way to determine how much data (if any) was sent.
        This is irritating, but identically follows python's API.
  */
  sendall : function(s) {
    while (s) {
      if (this.closed) {
        // this doesn't seem useful, but it is the documented behavior of Socket
        throw 'Socket is closed';
      }
      var sent = this.send(s);
      s = s.substring(sent);
    }
    return null;
  },

  /*
    Send data to the channel's "stderr" stream, without allowing partial
    results.  Unlike L{send_stderr}, this method continues to send data
    from the given string until all data has been sent or an error occurs.
    Nothing is returned.

    @param s: data to send to the client as "stderr" output.
    @type s: str

    @raise socket.timeout: if sending stalled for longer than the timeout
        set by L{settimeout}.
    @raise socket.error: if an error occured before the entire string was
        sent.

    @since: 1.1
  */
  sendall_stderr : function(s) {
    while (s) {
      if (this.closed) {
        throw 'Socket is closed';
      }
      sent = this.send_stderr(s);
      s = s.substring(sent);
    }
    return null;
  },

  /*
    Return a file-like object associated with this channel.  The optional
    C{mode} and C{bufsize} arguments are interpreted the same way as by
    the built-in C{file()} function in python.

    @return: object which can be used for python file I/O.
    @rtype: L{ChannelFile}
  */
  makefile : function() {
    return paramikojs.ChannelFile([this] + arguments);
  },

  /*
    Return a file-like object associated with this channel's stderr
    stream.   Only channels using L{exec_command} or L{invoke_shell}
    without a pty will ever have data on the stderr stream.

    The optional C{mode} and C{bufsize} arguments are interpreted the
    same way as by the built-in C{file()} function in python.  For a
    client, it only makes sense to open this file for reading.  For a
    server, it only makes sense to open this file for writing.

    @return: object which can be used for python file I/O.
    @rtype: L{ChannelFile}

    @since: 1.1
  */
  makefile_stderr : function() {
    return paramikojs.ChannelStderrFile([this] + arguments);
  },

  /*
    Shut down one or both halves of the connection.  If C{how} is 0,
    further receives are disallowed.  If C{how} is 1, further sends
    are disallowed.  If C{how} is 2, further sends and receives are
    disallowed.  This closes the stream in one or both directions.

    @param how: 0 (stop receiving), 1 (stop sending), or 2 (stop
        receiving and sending).
    @type how: int
  */
  shutdown : function(how) {
    if (how == 0 || how == 2) {
      // feign "read" shutdown
      this.eof_received = 1;
    }
    if (how == 1 || how == 2) {
      var m = this._send_eof();
      if (m) {
        this.transport._send_user_message(m);
      }
    }
  },

  /*
    Shutdown the receiving side of this socket, closing the stream in
    the incoming direction.  After this call, future reads on this
    channel will fail instantly.  This is a convenience method, equivalent
    to C{shutdown(0)}, for people who don't make it a habit to
    memorize unix constants from the 1970s.

    @since: 1.2
  */
  shutdown_read : function() {
    this.shutdown(0);
  },

  /*
    Shutdown the sending side of this socket, closing the stream in
    the outgoing direction.  After this call, future writes on this
    channel will fail instantly.  This is a convenience method, equivalent
    to C{shutdown(1)}, for people who don't make it a habit to
    memorize unix constants from the 1970s.

    @since: 1.2
  */
  shutdown_write : function() {
    this.shutdown(1);
  },


  //  calls from Transport


  _set_transport : function(transport) {
    this.transport = transport;
  },

  _set_window : function(window_size, max_packet_size) {
    this.in_window_size = window_size;
    this.in_max_packet_size = max_packet_size;
    // threshold of bytes we receive before we bother to send a window update
    this.in_window_threshold = parseInt(window_size / 10);
    this.in_window_sofar = 0;
    if(ssh_console.debug) console.debug('Max packet in: ' + max_packet_size + ' bytes');
  },

  _set_remote_channel : function(chanid, window_size, max_packet_size) {
    this.remote_chanid = chanid;
    this.out_window_size = window_size;
    this.out_max_packet_size = Math.max(max_packet_size, paramikojs.Channel.MIN_PACKET_SIZE);
    this.active = 1;
    if(ssh_console.debug) console.debug('Max packet out: ' + max_packet_size + ' bytes');
  },

  _request_success : function(m) {
    if(ssh_console.debug) console.debug('Sesch channel ' + this.chanid + ' request ok');
  },

  _request_failed : function(m) {
    var msgs = this._close_internal();

    for (var x = 0; x < msgs.length; ++x) {
      if (msgs[x]) {
        this.transport._send_user_message(msgs[x]);
      }
    }
  },

  _feed : function(m) {
    var s;
    if (typeof m == "string") {
      // passed from _feed_extended
      s = m;
    } else {
      s = m.get_string();
    }
    this.in_buffer += s;
  },

  _feed_extended : function(m) {
    var code = m.get_int();
    var s = m.get_string();
    if (code != 1) {
      if(ssh_console.debug) console.debug('unknown extended_data type ' + code + '; discarding');
      return;
    }
    if (this.combine_stderr) {
      this._feed(s);
    } else {
      this.in_stderr_buffer += s;
    }
  },

  _window_adjust : function(m) {
    var nbytes = m.get_int();
    if (this.ultra_debug) {
      if(ssh_console.debug) console.debug('window up ' + nbytes);
    }
    this.out_window_size += nbytes;
  },

  _handle_request : function(m) {
    var key = m.get_string();
    var want_reply = m.get_boolean();
    var server = this.transport.server_object;
    var ok = false;
    if (key == 'exit-status') {
      this.exit_status = m.get_int();
      ok = true;
    } else if (key == 'xon-xoff') {
      // ignore
      ok = true;
    } else if (key == 'pty-req') {
      var term = m.get_string();
      var width = m.get_int();
      var height = m.get_int();
      var pixelwidth = m.get_int();
      var pixelheight = m.get_int();
      var modes = m.get_string();
      if (!server) {
        ok = false;
      } else {
        ok = server.check_channel_pty_request(this, term, width, height, pixelwidth, pixelheight, modes);
      }
    } else if (key == 'shell') {
      if (!server) {
        ok = false;
      } else {
        ok = server.check_channel_shell_request(this);
      }
    } else if (key == 'exec') {
      var cmd = m.get_string();
      if (!server) {
        ok = false;
      } else {
        ok = server.check_channel_exec_request(this, cmd);
      }
    } else if (key == 'subsystem') {
      var name = m.get_string();
      if (!server) {
        ok = false;
      } else {
        ok = server.check_channel_subsystem_request(this, name);
      }
    } else if (key == 'window-change') {
      var width = m.get_int();
      var height = m.get_int();
      var pixelwidth = m.get_int();
      var pixelheight = m.get_int();
      if (!server) {
        ok = false;
      } else {
        ok = server.check_channel_window_change_request(this, width, height, pixelwidth, pixelheight);
      }
    } else if (key == 'x11-req') {
      var single_connection = m.get_boolean();
      var auth_proto = m.get_string();
      var auth_cookie = m.get_string();
      var screen_number = m.get_int();
      if (!server) {
        ok = false;
      } else {
        ok = server.check_channel_x11_request(this, single_connection, auth_proto, auth_cookie, screen_number);
      }
    } else {
      if(ssh_console.debug) console.debug('Unhandled channel request "' + key + '"');
      ok = false;
    }
    if (want_reply) {
      var m = new paramikojs.Message();
      if (ok) {
        m.add_byte(String.fromCharCode(paramikojs.MSG_CHANNEL_SUCCESS));
      } else {
        m.add_byte(String.fromCharCode(paramikojs.MSG_CHANNEL_FAILURE));
      }
      m.add_int(this.remote_chanid);
      this.transport._send_user_message(m);
    }
  },

  _handle_eof : function(m) {
    if (!this.eof_received) {
      this.eof_received = true;
      this.in_buffer = "";
      this.in_stderr_buffer = "";
      if (this._pipe) {
        this._pipe.set_forever();
      }
    }
    if(ssh_console.debug) console.debug('EOF received (' + this._name + ')');
  },

  _handle_close : function(m) {
    var msgs = this._close_internal();
    this.transport._unlink_channel(this.chanid);

    for (var x = 0; x < msgs.length; ++x) {
      if (msgs[x]) {
        this.transport._send_user_message(msgs[x]);
      }
    }
  },


  //  internals...
  /*
  _log : function(level, msg) {
    this.logger.log(level, msg);
  },
  */

  _set_closed : function() {
    this.closed = true;
    this.in_buffer = "";
    this.in_stderr_buffer = "";
  },

  _send_eof : function() {
    if (this.eof_sent) {
      return null;
    }
    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_CHANNEL_EOF));
    m.add_int(this.remote_chanid);
    this.eof_sent = true;
    if(ssh_console.debug) console.debug('EOF sent (' + this._name + ')');
    return m;
  },

  _close_internal : function() {
    if (!this.active || this.closed) {
      return [null, null];
    }
    var m1 = this._send_eof();
    var m2 = new paramikojs.Message();
    m2.add_byte(String.fromCharCode(paramikojs.MSG_CHANNEL_CLOSE));
    m2.add_int(this.remote_chanid);
    this._set_closed();
    // can't unlink from the Transport yet -- the remote side may still
    // try to send meta-data (exit-status, etc)
    return [m1, m2];
  },

  _unlink : function() {
    // server connection could die before we become active: still signal the close!
    if (this.closed) {
      return;
    }
    this._set_closed();
    this.transport._unlink_channel(this.chanid);
  },

  _check_add_window : function(n) {
    if (this.closed || this.eof_received || !this.active) {
      return 0;
    }
    if (this.ultra_debug) {
      if(ssh_console.debug) console.debug('addwindow ' + n);
    }
    this.in_window_sofar += n;
    if (this.in_window_sofar <= this.in_window_threshold) {
      return 0;
    }
    if (this.ultra_debug) {
      if(ssh_console.debug) console.debug('addwindow send ' + this.in_window_sofar);
    }
    var out = this.in_window_sofar;
    this.in_window_sofar = 0;
    return out;
  },

  /*
    Wait for the send window to open up, and allocate up to C{size} bytes
    for transmission.  If no space opens up before the timeout, a timeout
    exception is raised.  Returns the number of bytes available to send
    (may be less than requested).
  */
  _wait_for_send_window : function(size) {
    if (this.closed || this.eof_sent) {
      return 0;
    }
    if (this.out_window_size == 0) {
      throw new paramikojs.ssh_exception.WaitException("wait");
    }
    // we have some window to squeeze into
    if (this.closed || this.eof_sent) {
      return 0;
    }
    if (this.out_window_size < size) {
      size = this.out_window_size;
    }
    if (this.out_max_packet_size - 64 < size) {
      size = this.out_max_packet_size - 64;
    }
    this.out_window_size -= size;
    if (this.ultra_debug) {
      if(ssh_console.debug) console.debug('window down to ' + this.out_window_size);
    }
    return size;
  }
};


/*
  A file-like wrapper around L{Channel}.  A ChannelFile is created by calling
  L{Channel.makefile}.

  @bug: To correctly emulate the file object created from a socket's
      C{makefile} method, a L{Channel} and its C{ChannelFile} should be able
      to be closed or garbage-collected independently.  Currently, closing
      the C{ChannelFile} does nothing but flush the buffer.
*/
paramikojs.ChannelFile = function(channel, mode, bufsize) {
  inherit(this, new paramikojs.BufferedFile());

  mode = mode || 'r';
  bufsize = bufsize || -1;
  this.channel = channel;
  this._set_mode(mode, bufsize);
};

paramikojs.ChannelFile.prototype = {
  _read : function(size) {
    return this.channel.recv(size);
  },

  _write : function(data) {
    this.channel.sendall(data);
    return data.length;
  }
};

paramikojs.ChannelStderrFile = function(channel, mode, bufsize) {
  mode = mode || 'r';
  bufsize = bufsize || -1;

  inherit(this, new paramikojs.ChannelFile(channel, mode, bufsize));
};

paramikojs.ChannelStderrFile.prototype = {
  _read : function(size) {
    return this.channel.recv_stderr(size);
  },

  _write : function(data) {
    this.channel.sendall_stderr(data);
    return data.length;
  }
};

// Source: client.js
/*
  Policy for automatically adding the hostname and new host key to the
  local L{HostKeys} object, and saving it.  This is used by L{SSHClient}.
*/
paramikojs.AutoAddPolicy = function () {

};

paramikojs.AutoAddPolicy.prototype = {
  missing_host_key : function(client, hostname, key, callback) {
    client._host_keys.add(hostname, key.get_name(), key);
    if (client._host_keys_filename) {
      client.save_host_keys();
    }
    if(ssh_console.debug) console.debug('Adding ' + key.get_name() + ' host key for ' + hostname + ': ' + paramikojs.util.hexify(key.get_fingerprint()));
    callback(true);
  }
};

/*
  Policy for asking the user before adding the hostname and new host key to the
  local L{HostKeys} object, and saving it.  This is used by L{SSHClient}.
*/
paramikojs.AskPolicy = function (onSftpCache) {
  this.onSftpCache = onSftpCache;
};

paramikojs.AskPolicy.prototype = {
  missing_host_key : function(client, hostname, key, callback) {
    var raw_fingerprint = paramikojs.util.hexify(key.get_fingerprint()).toLowerCase();
    var fingerprint = "";
    for (var x = 0; x < raw_fingerprint.length; x += 2) {
      fingerprint += raw_fingerprint[x] + raw_fingerprint[x + 1] + ':';
    }
    fingerprint = fingerprint.substring(0, fingerprint.length - 1);

    var cacheCallback = function(answer) {
      if (answer == 'y') {
        client._host_keys.add(hostname, key.get_name(), key);
        if (client._host_keys_filename) {
          client.save_host_keys();
        }
        if(ssh_console.debug) console.debug('Adding ' + key.get_name() + ' host key for ' + hostname + ': ' + fingerprint);
        callback(true);
      } else if (!answer) {
        callback(false);
      } else {
        callback(true);
      }
    };

    //client._observer.onSftpCache(null, key.get_name() + ' ' + key.get_bits() + '\n' + fingerprint, cacheCallback);
    this.onSftpCache(null, key.get_name() + ' ' + key.get_bits() + '\n' + fingerprint, cacheCallback);
  }
};


/*
  Policy for automatically rejecting the unknown hostname & key.  This is
  used by L{SSHClient}.
*/
paramikojs.RejectPolicy = function () {

};

paramikojs.RejectPolicy.prototype = {
  missing_host_key : function(client, hostname, key, callback) {
    if(ssh_console.debug) console.debug('Rejecting ' + key.get_name() + ' host key for ' + hostname + ': ' + paramikojs.util.hexify(key.get_fingerprint()));
    callback(false);
  }
};


/*
  Policy for logging a python-style warning for an unknown host key, but
  accepting it. This is used by L{SSHClient}.
*/
paramikojs.WarningPolicy = function () {

}

paramikojs.WarningPolicy.prototype = {
  missing_host_key : function(client, hostname, key, callback) {
    if(ssh_console.debug) console.debug('Unknown ' + key.get_name() + ' host key for ' + hostname + ': ' + paramikojs.util.hexify(key.get_fingerprint()));
    callback(true);
  }
};


/*
  A high-level representation of a session with an SSH server.  This class
  wraps L{Transport}, L{Channel}, and L{SFTPClient} to take care of most
  aspects of authenticating and opening channels.  A typical use case is::

      client = SSHClient()
      client.load_system_host_keys()
      client.connect('ssh.example.com')
      stdin, stdout, stderr = client.exec_command('ls -l')

  You may pass in explicit overrides for authentication and server host key
  checking.  The default mechanism is to try to use local key files or an
  SSH agent (if one is running).

  @since: 1.6
*/
paramikojs.SSHClient = function () {
  /*
    Create a new SSHClient.
  */
  this._system_host_keys = new paramikojs.HostKeys();
  this._host_keys = new paramikojs.HostKeys();
  this._host_keys_filename = null;
  this._log_channel = null;
  this._policy = new paramikojs.RejectPolicy();
  this._transport = null;
  this._agent = null;
};

paramikojs.SSHClient.prototype = {
  SSH_PORT : 22,

  /*
    Load host keys from a system (read-only) file.  Host keys read with
    this method will not be saved back by L{save_host_keys}.

    This method can be called multiple times.  Each new set of host keys
    will be merged with the existing set (new replacing old if there are
    conflicts).

    If C{filename} is left as C{None}, an attempt will be made to read
    keys from the user's local "known hosts" file, as used by OpenSSH,
    and no exception will be raised if the file can't be read.  This is
    probably only useful on posix.

    @param filename: the filename to read, or C{None}
    @type filename: str

    @raise IOError: if a filename was provided and the file could not be
        read
  */
  load_system_host_keys : function(filename) {
    if (!filename) {
      // try the user's .ssh key file, and mask exceptions
      this._system_host_keys.load('~/.ssh/known_hosts');
      return;
    }
    this._system_host_keys.load(filename);
  },

  /*
    Load host keys from a local host-key file.  Host keys read with this
    method will be checked I{after} keys loaded via L{load_system_host_keys},
    but will be saved back by L{save_host_keys} (so they can be modified).
    The missing host key policy L{AutoAddPolicy} adds keys to this set and
    saves them, when connecting to a previously-unknown server.

    This method can be called multiple times.  Each new set of host keys
    will be merged with the existing set (new replacing old if there are
    conflicts).  When automatically saving, the last hostname is used.

    @param filename: the filename to read
    @type filename: str

    @raise IOError: if the filename could not be read
  */
  load_host_keys_lines : function(lines) {
    this._host_keys.load_from_line(lines);
  },

  load_host_keys : function(filename) {
    this._host_keys_filename = filename;
    this._host_keys.load(filename);
  },

  /*
    Save the host keys back to a file.  Only the host keys loaded with
    L{load_host_keys} (plus any added directly) will be saved -- not any
    host keys loaded with L{load_system_host_keys}.

    @param filename: the filename to save to
    @type filename: str

    @raise IOError: if the file could not be written
  */
  save_host_keys : function(filename) {
    this._host_keys.save(filename);
  },

  /*
    Get the local L{HostKeys} object.  This can be used to examine the
    local host keys or change them.

    @return: the local host keys
    @rtype: L{HostKeys}
  */
  get_host_keys : function() {
    return this._host_keys;
  },

  /*
    Set the policy to use when connecting to a server that doesn't have a
    host key in either the system or local L{HostKeys} objects.  The
    default policy is to reject all unknown servers (using L{RejectPolicy}).
    You may substitute L{AutoAddPolicy} or write your own policy class.

    @param policy: the policy to use when receiving a host key from a
        previously-unknown server
    @type policy: L{MissingHostKeyPolicy}
  */
  set_missing_host_key_policy : function(policy) {
    this._policy = policy;
  },

  /*
    Connect to an SSH server and authenticate to it.  The server's host key
    is checked against the system host keys (see L{load_system_host_keys})
    and any local host keys (L{load_host_keys}).  If the server's hostname
    is not found in either set of host keys, the missing host key policy
    is used (see L{set_missing_host_key_policy}).  The default policy is
    to reject the key and raise an L{SSHException}.

    Authentication is attempted in the following order of priority:

        - The C{pkey} or C{key_filename} passed in (if any)
        - Any key we can find through an SSH agent
        - Any "id_rsa" or "id_dsa" key discoverable in C{~/.ssh/}
        - Plain username/password auth, if a password was given

    If a private key requires a password to unlock it, and a password is
    passed in, that password will be used to attempt to unlock the key.

    @param hostname: the server to connect to
    @type hostname: str
    @param port: the server port to connect to
    @type port: int
    @param username: the username to authenticate as (defaults to the
        current local username)
    @type username: str
    @param password: a password to use for authentication or for unlocking
        a private key
    @type password: str
    @param pkey: an optional private key to use for authentication
    @type pkey: L{PKey}
    @param key_filename: the filename, or list of filenames, of optional
        private key(s) to try for authentication
    @type key_filename: str or list(str)
    @param timeout: an optional timeout (in seconds) for the TCP connect
    @type timeout: float
    @param allow_agent: set to False to disable connecting to the SSH agent
    @type allow_agent: bool
    @param look_for_keys: set to False to disable searching for discoverable
        private key files in C{~/.ssh/}
    @type look_for_keys: bool
    @param compress: set to True to turn on compression
    @type compress: bool

    @raise BadHostKeyException: if the server's host key could not be
        verified
    @raise AuthenticationException: if authentication failed
    @raise SSHException: if there was any other error connecting or
        establishing an SSH session
    @raise socket.error: if a socket error occurred while connecting
  */
  connect : function(writeCallback, auth_success,
            hostname, port, username, password, pkey,
            key_filename, timeout, allow_agent, look_for_keys,
            compress) {
    port = port || this.SSH_PORT;
    allow_agent = allow_agent == undefined ? true : allow_agent;
    look_for_keys = look_for_keys == undefined ? true : look_for_keys;

    var self = this;
    var authenticatedCallback = function() {
      var server_key = self._transport.get_remote_server_key();
      var keytype = server_key.get_name();
      var server_hostkey_name, our_server_key;

      if (port == self.SSH_PORT) {
        server_hostkey_name = hostname;
      } else {
        server_hostkey_name = "[" + hostname + "]:" + port;
      }
      if (self._system_host_keys._entries.length) {
        our_server_key = self._system_host_keys.get(server_hostkey_name)[keytype];
      }
      if (!our_server_key && self._host_keys._entries.length) {
        our_server_key = self._host_keys.get(server_hostkey_name)[keytype];
      }

      var cacheCallback = function(accepted) {
        if (!accepted) {
          self.close(true);
          return;
        }

        var key_filenames;
        if (!key_filename) {
          key_filenames = [];
        } else if (typeof key_filename == "string") {
          key_filenames = [ key_filename ];
        } else {
          key_filenames = key_filename;
        }
        self._auth(username, password, pkey, key_filenames, allow_agent, look_for_keys);
      };

      if (!our_server_key) {
        // will raise exception if the key is rejected; let that fall out
        self._policy.missing_host_key(self, server_hostkey_name, server_key, cacheCallback);
        // if the callback returns, assume the key is ok
        our_server_key = server_key;
      } else if (!server_key.compare(our_server_key)) {
        self._policy.missing_host_key(self, server_hostkey_name, server_key, cacheCallback);
        // if the callback returns, assume the key is ok
      } else {
        cacheCallback(true);
      }
    };

    this._transport = new paramikojs.transport();
    this._transport.writeCallback = writeCallback;
    this._transport.use_compression(compress);
    this._transport.connect(null, authenticatedCallback, username, password, pkey, auth_success);

    return this._transport;
  },

  /*
    Close this SSHClient and its underlying L{Transport}.
  */
  close : function(legitClose) {
    if (!this._transport) {
      return;
    }
    this.legitClose = legitClose;
    this._transport.close();
    this._transport = null;

    if (this._agent) {
      this._agent.close();
      this._agent = null;
    }
  },

  /*
    Execute a command on the SSH server.  A new L{Channel} is opened and
    the requested command is executed.  The command's input and output
    streams are returned as python C{file}-like objects representing
    stdin, stdout, and stderr.

    @param command: the command to execute
    @type command: str
    @param bufsize: interpreted the same way as by the built-in C{file()} function in python
    @type bufsize: int
    @return: the stdin, stdout, and stderr of the executing command
    @rtype: tuple(L{ChannelFile}, L{ChannelFile}, L{ChannelFile})

    @raise SSHException: if the server fails to execute the command
  */
  exec_command : function(command, bufsize) {
    bufsize = bufsize || -1;
    var on_success = function() {
      chan.exec_command(command);
      var stdin = chan.makefile('wb', bufsize);
      var stdout = chan.makefile('rb', bufsize);
      var stderr = chan.makefile_stderr('rb', bufsize);
      return [stdin, stdout, stderr];
    };
    var chan = this._transport.open_session(on_success);
  },

  /*
    Start an interactive shell session on the SSH server.  A new L{Channel}
    is opened and connected to a pseudo-terminal using the requested
    terminal type and size.

    @param term: the terminal type to emulate (for example, C{"vt100"})
    @type term: str
    @param width: the width (in characters) of the terminal window
    @type width: int
    @param height: the height (in characters) of the terminal window
    @type height: int
    @return: a new channel connected to the remote shell
    @rtype: L{Channel}

    @raise SSHException: if the server fails to invoke a shell
  */
  invoke_shell : function(term, width, height, callback) {
    term = term || 'vt100';
    width = width || 80;
    height = height || 24;
    var on_success = function(chan) {
      chan.get_pty(term, width, height);
      chan.invoke_shell();
      callback(chan);
    };
    this._transport.open_session(on_success);
  },

  /*
    Open an SFTP session on the SSH server.

    @return: a new SFTP session object
    @rtype: L{SFTPClient}
  */
  open_sftp : function(callback) {
    this._transport.open_sftp_client(callback);
  },

  /*
    Return the underlying L{Transport} object for this SSH connection.
    This can be used to perform lower-level tasks, like opening specific
    kinds of channels.

    @return: the Transport for this connection
    @rtype: L{Transport}
  */
  get_transport : function() {
    return this._transport;
  },

  /*
    Try, in order:

        - The key passed in, if one was passed in.
        - Any key we can find through an SSH agent (if allowed).
        - Any "id_rsa" or "id_dsa" key discoverable in ~/.ssh/ (if allowed).
        - Plain username/password auth, if a password was given.

    (The password might be needed to unlock a private key.)
  */
  _auth : function(username, password, pkey, key_filenames, allow_agent, look_for_keys) {
    var saved_exception = null;
    var key;

    if (pkey) {
      try {
        if(ssh_console.debug) console.debug('Trying SSH key ' + paramikojs.util.hexify(pkey.get_fingerprint()));
        this._transport.auth_publickey(username, pkey);
        return;
      } catch (ex) {
        saved_exception = ex;
      }
    }

    for (var y = 0; y < key_filenames.length; ++y) {
      for (var x = 0; x < 2; ++x) {
        try {
          var pkey_class = [paramikojs.RSAKey, paramikojs.DSSKey][x];
          key = new pkey_class(null, null, key_filenames[y], password);
          if(ssh_console.debug) console.debug('Trying key ' + paramikojs.util.hexify(key.get_fingerprint()) + ' from ' + key_filenames[y]);
          this._transport.auth_publickey(username, key);
          return;
        } catch(ex) {
          if(ssh_console.debug) console.debug('Tried key: ' + ex.message);
          saved_exception = ex;
        }
      }
    }

    if (false && allow_agent) { // todo fixme, agent sockets don't work right now...
      if (!this._agent) {
        this._agent = new paramikojs.Agent();
      }

      for (key in this._agent.get_keys()) {
        try {
          if(ssh_console.debug) console.debug('Trying SSH agent key ' + paramikojs.util.hexify(key.get_fingerprint()));
          this._transport.auth_publickey(username, key);
          return;
        } catch(ex) {
          saved_exception = ex;
        }
      }
    }

    var keyfiles = [];
    /*
      var rsa_key = localFile.init('~/.ssh/id_rsa');
      var dsa_key = localFile.init('~/.ssh/id_dsa');
      if (rsa_key && rsa_key.exists()) {
        keyfiles.push([paramikojs.RSAKey, rsa_key]);
      }
      if (dsa_key && dsa_key.exists()) {
        keyfiles.push([paramikojs.DSSKey, dsa_key]);
      }
    */
    if (!look_for_keys) {
      keyfiles = [];
    }

    for (var x = 0; x < keyfiles.length; ++x) {
      try {
        key = new keyfiles[x][0](null, null, keyfiles[x][1].path, password);
        if(ssh_console.debug) console.debug('Trying discovered key ' + paramikojs.util.hexify(key.get_fingerprint()) + ' in ' + keyfiles[x][1].path);
        this._transport.auth_publickey(username, key);
        return;
      } catch(ex) {
        saved_exception = ex;
      }
    }

    //if (password) {
      try {
        this._transport.auth_password(username, password);
        return;
      } catch(ex) {
        saved_exception = ex;
      }
    //}

    // if we got an auth-failed exception earlier, re-raise it
    if (saved_exception) {
      throw saved_exception;
    }
    throw new paramikojs.ssh_exception.AuthenticationException('No authentication methods available');
  }

//  _log : function(level, msg) {
//    this._transport._log(level, msg);
//  }
};

// Source: compress.js
paramikojs.ZlibCompressor = function () {

};

paramikojs.ZlibCompressor.prototype = {

};

paramikojs.ZlibDecompressor = function () {

};

paramikojs.ZlibDecompressor.prototype = {

};

// Source: dsskey.js
/*
  Representation of a DSS key which can be used to sign and verify SSH2
  data.
*/
paramikojs.DSSKey = function(msg, data, filename, password, vals, file_obj) {
  inherit(this, new paramikojs.PKey());

  this.p = null;
  this.q = null;
  this.g = null;
  this.y = null;
  this.x = null;
  if (file_obj) {
    this._from_private_key(file_obj, password);
    return;
  }
  if (filename) {
    this._from_private_key_file(filename, password);
    return;
  }
  if (!msg && data) {
    msg = new paramikojs.Message(data);
  }
  if (vals) {
    this.p = vals[0];
    this.q = vals[1];
    this.g = vals[2];
    this.y = vals[3];
  } else {
    if (!msg) {
      throw new paramikojs.ssh_exception.SSHException('Key object may not be empty');
    }
    if (msg.get_string() != 'ssh-dss') {
      throw new paramikojs.ssh_exception.SSHException('Invalid key');
    }
    this.p = msg.get_mpint();
    this.q = msg.get_mpint();
    this.g = msg.get_mpint();
    this.y = msg.get_mpint();
  }
  this.size = paramikojs.util.bit_length(this.p);
};

paramikojs.DSSKey.prototype = {
  toString : function() {
    var m = new paramikojs.Message();
    m.add_string('ssh-dss');
    m.add_mpint(this.p);
    m.add_mpint(this.q);
    m.add_mpint(this.g);
    m.add_mpint(this.y);
    return m.toString();
  },

  compare : function(other) {
    if (this.get_name() != other.get_name()) {
      return false;
    }
    if (!this.p.equals(other.p)) {
      return false;
    }
    if (!this.q.equals(other.q)) {
      return false;
    }
    if (!this.g.equals(other.g)) {
      return false;
    }
    if (!this.y.equals(other.y)) {
      return false;
    }
    return true;
  },

  get_name : function() {
    return 'ssh-dss';
  },

  get_bits : function() {
    return this.size;
  },

  can_sign : function() {
    return this.x != null;
  },

  sign_ssh_data : function(rng, data, callback) {
    var digest = new kryptos.hash.SHA(data).digest();
    var dss = new kryptos.publicKey.DSA().construct(this.y, this.g, this.p, this.q, this.x);
    // generate a suitable k
    var qsize = paramikojs.util.deflate_long(this.q, 0).length;
    var k;
    var two = new BigInteger("2", 10);
    while (true) {
      k = paramikojs.util.inflate_long(rng.read(qsize), 1);
      if (k.compareTo(two) > 0 && this.q.compareTo(k) > 0) {
        break;
      }
    }
    var result = dss.sign(paramikojs.util.inflate_long(digest, 1), k);
    var m = new paramikojs.Message();
    m.add_string('ssh-dss');
    // apparently, in rare cases, r or s may be shorter than 20 bytes!
    var rstr = paramikojs.util.deflate_long(result[0], 0);
    var sstr = paramikojs.util.deflate_long(result[1], 0);
    if (rstr.length < 20) {
      rstr = new Array(20 - rstr.length + 1).join('\x00') + rstr;
    }
    if (sstr.length < 20) {
      sstr = new Array(20 - rstr.length + 1).join('\x00') + sstr;
    }
    m.add_string(rstr + sstr);
    callback(m);
  },

  verify_ssh_sig : function(data, msg) {
    var sig;
    var kind;
    if (msg.toString().length == 40) {
      // spies.com bug: signature has no header
      sig = msg.toString();
    } else {
      kind = msg.get_string();
      if (kind != 'ssh-dss') {
        return 0;
      }
      sig = msg.get_string();
    }

    // pull out (r, s) which are NOT encoded as mpints
    var sigR = paramikojs.util.inflate_long(sig.substring(0, 20), 1);
    var sigS = paramikojs.util.inflate_long(sig.substring(20), 1);
    var sigM = paramikojs.util.inflate_long(new kryptos.hash.SHA(data).digest(), 1);

    var dss = new kryptos.publicKey.DSA().construct(this.y, this.g, this.p, this.q);
    return dss.verify(sigM, [sigR, sigS]);
  },

  _encode_key : function() {
    if (!this.x) {
      throw new paramikojs.ssh_exception.SSHException('Not enough key information');
    }
    var keylist = [ 0, this.p, this.q, this.g, this.y, this.x ];
    var b;
    try {
        b = new paramikojs.BER();
        b.encode(keylist);
    } catch(ex) {
      throw new paramikojs.ssh_exception.SSHException('Unable to create ber encoding of key');
    }
    return b.toString();
  },

  write_private_key_file : function(filename, password) {
    this._write_private_key_file('DSA', filename, this._encode_key(), password);
  },

  write_private_key : function(file_obj, password) {
    this._write_private_key('DSA', file_obj, this._encode_key(), password);
  },

  /*
    Generate a new private DSS key.  This factory function can be used to
    generate a new host key or authentication key.

    @param bits: number of bits the generated key should be.
    @type bits: int
    @param progress_func: an optional function to call at key points in
        key generation (used by C{pyCrypto.PublicKey}).
    @type progress_func: function
    @return: new private key
    @rtype: L{DSSKey}
  */
  generate : function(bits, progress_func) {
    bits = bits || 1024;
    var dsa = new kryptos.publicKey.DSA().generate(bits, paramikojs.rng.read, progress_func);
    var key = new paramikojs.DSSKey(null, null, null, null, [dsa.p, dsa.q, dsa.g, dsa.y], null);
    key.x = dsa.x;
    return key;
  },


  //  internals...


  _from_private_key_file : function(filename, password) {
    var data;
    var keylist = null;
    try {
      data = this._read_private_key_file('DSA', filename, password);
    } catch (ex) {
      if (ex instanceof paramikojs.ssh_exception.IsPuttyKey) {
        data = null;
        keylist = this._read_putty_private_key('DSA', ex.lines, password);
      } else {
        throw ex;
      }
    }
    this._decode_key(data, keylist);
  },

  _from_private_key : function(file_obj, password) {
    var data = this._read_private_key('DSA', file_obj, password);
    this._decode_key(data);
  },

  _decode_key : function(data, keylist) {
    // private key file contains:
    // DSAPrivateKey = { version = 0, p, q, g, y, x }
    try {
      keylist = keylist || new paramikojs.BER(data).decode();
    } catch(ex) {
      throw new paramikojs.ssh_exception.SSHException('Unable to parse key file');
    }
    if (!(keylist instanceof Array) || keylist.length < 6 || keylist[0] != 0) {
      throw new paramikojs.ssh_exception.SSHException('not a valid DSA private key file (bad ber encoding)');
    }
    this.p = keylist[1];
    this.q = keylist[2];
    this.g = keylist[3];
    this.y = keylist[4];
    this.x = keylist[5];
    this.size = paramikojs.util.bit_length(this.p);
  }
};

// Source: file.js
/*
  Reusable base class to implement python-style file buffering around a
  simpler stream.
*/
paramikojs.BufferedFile = function() {
  this.newlines = null;
  this._flags = 0;
  this._bufsize = this._DEFAULT_BUFSIZE;
  this._wbuffer = "";
  this._rbuffer = "";
  this._at_trailing_cr = false;
  this._closed = false;
  // pos - position within the file, according to the user
  // realpos - position according the OS
  // (these may be different because we buffer for line reading)
  this._pos = this._realpos = 0;
  // size only matters for seekable files
  this._size = 0;
};

paramikojs.BufferedFile.prototype = {
  _DEFAULT_BUFSIZE : 8192,

  SEEK_SET : 0,
  SEEK_CUR : 1,
  SEEK_END : 2,

  FLAG_READ : 0x1,
  FLAG_WRITE : 0x2,
  FLAG_APPEND : 0x4,
  FLAG_BINARY : 0x10,
  FLAG_BUFFERED : 0x20,
  FLAG_LINE_BUFFERED : 0x40,
  FLAG_UNIVERSAL_NEWLINE : 0x80,

  /*
    Close the file.  Future read and write operations will fail.
  */
  __close : function() {
    this.flush();
    this._closed = true;
  },

  close : function() {
    this.__close();
  },

  /*
    Write out any data in the write buffer.  This may do nothing if write
    buffering is not turned on.
  */
  flush : function(callback) {
    this._write_all(this._wbuffer, callback);
    this._wbuffer = "";
    return;
  },

  /*
    Returns the next line from the input, or raises L{StopIteration} when
    EOF is hit.  Unlike python file objects, it's okay to mix calls to
    C{next} and L{readline}.

    @raise StopIteration: when the end of the file is reached.

    @return: a line read from the file.
    @rtype: str
  */
  next : function() {
    var line = this.readline();
    if (!line) {
      throw StopIteration;
    }
    return line;
  },

  /*
    Read at most C{size} bytes from the file (less if we hit the end of the
    file first).  If the C{size} argument is negative or omitted, read all
    the remaining data in the file.

    @param size: maximum number of bytes to read
    @type size: int
    @return: data read from the file, or an empty string if EOF was
        encountered immediately
    @rtype: str
  */
  read : function(size, callback) {
    if (this._closed) {
      throw new paramikojs.ssh_exception.IOError('File is closed');
    }
    if (!(this._flags & this.FLAG_READ)) {
      throw new paramikojs.ssh_exception.IOError('File is not open for reading');
    }
    var result;
    if (!size || size < 0) {
      // go for broke
      result = this._rbuffer;
      this._rbuffer = '';
      this._pos += result.length;
      this.read_all(callback, result);
      return;
    }
    if (size <= this._rbuffer.length) {
      result = this._rbuffer.substring(0, size);
      this._rbuffer = this._rbuffer.substring(size);
      this._pos += result.length;
      callback(result);
      return;
    }
    this.read_some(callback, size);
  },

  read_all : function(callback, result) {
    var self = this;
    var read_callback = function(new_data, eofError, ioError) {
      if (eofError) {
        new_data = null;
      }

      if (!new_data || new_data.length == 0) {
        callback(result);
        return;
      }
      result += new_data;
      self._realpos += new_data.length;
      self._pos += new_data.length;
      self.read_all(callback, result);
    };
    this._read(this._DEFAULT_BUFSIZE, read_callback);
  },

  read_some : function(callback, size) {
    var self = this;
    var read_callback = function(new_data, eofError, ioError) {
      if (eofError) {
        new_data = null;
      }

      if (!new_data || new_data.length == 0) {
        self.read_finish(callback, size);
        return;
      }

      self._rbuffer += new_data;
      self._realpos += new_data.length;

      self.read_some(callback, size);
    };

    if (this._rbuffer.length < size) {
      var read_size = size - this._rbuffer.length;
      if (this._flags & this.FLAG_BUFFERED) {
        read_size = Math.max(this._bufsize, read_size);
      }
      this._read(read_size, read_callback);
      return;
    }
    this.read_finish(callback, size);
  },

  read_finish : function(callback, size) {
    var result = this._rbuffer.substring(0, size);
    this._rbuffer = this._rbuffer.substring(size);
    this._pos += result.length;
    callback(result);
  },

  /*
    Read one entire line from the file.  A trailing newline character is
    kept in the string (but may be absent when a file ends with an
    incomplete line).  If the size argument is present and non-negative, it
    is a maximum byte count (including the trailing newline) and an
    incomplete line may be returned.  An empty string is returned only when
    EOF is encountered immediately.

    @note: Unlike stdio's C{fgets()}, the returned string contains null
    characters (C{'\\0'}) if they occurred in the input.

    @param size: maximum length of returned string.
    @type size: int
    @return: next line of the file, or an empty string if the end of the
        file has been reached.
    @rtype: str
  */
  readline : function(size) {
    // todo transcode if necessary
    /*
    # it's almost silly how complex this function is.
    if self._closed:
        raise IOError('File is closed')
    if not (self._flags & self.FLAG_READ):
        raise IOError('File not open for reading')
    line = self._rbuffer
    while True:
        if self._at_trailing_cr and (self._flags & self.FLAG_UNIVERSAL_NEWLINE) and (len(line) > 0):
            # edge case: the newline may be '\r\n' and we may have read
            # only the first '\r' last time.
            if line[0] == '\n':
                line = line[1:]
                self._record_newline('\r\n')
            else:
                self._record_newline('\r')
            self._at_trailing_cr = False
        # check size before looking for a linefeed, in case we already have
        # enough.
        if (size is not None) and (size >= 0):
            if len(line) >= size:
                # truncate line and return
                self._rbuffer = line[size:]
                line = line[:size]
                self._pos += len(line)
                return line
            n = size - len(line)
        else:
            n = self._bufsize
        if ('\n' in line) or ((self._flags & self.FLAG_UNIVERSAL_NEWLINE) and ('\r' in line)):
            break
        try:
            new_data = self._read(n)
        except EOFError:
            new_data = None
        if (new_data is None) or (len(new_data) == 0):
            self._rbuffer = ''
            self._pos += len(line)
            return line
        line += new_data
        self._realpos += len(new_data)
    # find the newline
    pos = line.find('\n')
    if self._flags & self.FLAG_UNIVERSAL_NEWLINE:
        rpos = line.find('\r')
        if (rpos >= 0) and ((rpos < pos) or (pos < 0)):
            pos = rpos
    xpos = pos + 1
    if (line[pos] == '\r') and (xpos < len(line)) and (line[xpos] == '\n'):
        xpos += 1
    self._rbuffer = line[xpos:]
    lf = line[pos:xpos]
    line = line[:pos] + '\n'
    if (len(self._rbuffer) == 0) and (lf == '\r'):
        # we could read the line up to a '\r' and there could still be a
        # '\n' following that we read next time.  note that and eat it.
        self._at_trailing_cr = True
    else:
        self._record_newline(lf)
    self._pos += len(line)
    return line
    */
  },

  /*
    Read all remaining lines using L{readline} and return them as a list.
    If the optional C{sizehint} argument is present, instead of reading up
    to EOF, whole lines totalling approximately sizehint bytes (possibly
    after rounding up to an internal buffer size) are read.

    @param sizehint: desired maximum number of bytes to read.
    @type sizehint: int
    @return: list of lines read from the file.
    @rtype: list
  */
  readlines : function(sizehint) {
    // todo transcode if necessary
    /*
    lines = []
    bytes = 0
    while True:
        line = self.readline()
        if len(line) == 0:
            break
        lines.append(line)
        bytes += len(line)
        if (sizehint is not None) and (bytes >= sizehint):
            break
    return lines
    */
  },

  /*
    Set the file's current position, like stdio's C{fseek}.  Not all file
    objects support seeking.

    @note: If a file is opened in append mode (C{'a'} or C{'a+'}), any seek
        operations will be undone at the next write (as the file position
        will move back to the end of the file).

    @param offset: position to move to within the file, relative to
        C{whence}.
    @type offset: int
    @param whence: type of movement: 0 = absolute; 1 = relative to the
        current position; 2 = relative to the end of the file.
    @type whence: int

    @raise IOError: if the file doesn't support random access.
  */
  seek : function(offset, whence) {
    throw new paramikojs.ssh_exception.IOError('File does not support seeking.');
  },

  /*
    Return the file's current position.  This may not be accurate or
    useful if the underlying file doesn't support random access, or was
    opened in append mode.

    @return: file position (in bytes).
    @rtype: int
  */
  tell : function() {
    return this._pos;
  },

  /*
    Write data to the file.  If write buffering is on (C{bufsize} was
    specified and non-zero), some or all of the data may not actually be
    written yet.  (Use L{flush} or L{close} to force buffered data to be
    written out.)

    @param data: data to write.
    @type data: str
  */
  write : function(data, callback) {
    if (this._closed) {
      throw new paramikojs.ssh_exception.IOError('File is closed');
    }
    if (!(this._flags & this.FLAG_WRITE)) {
      throw new paramikojs.ssh_exception.IOError('File not open for writing');
    }
    if (!(this._flags & this.FLAG_BUFFERED)) {
      this._write_all(data, callback);
      return;
    }
    this._wbuffer += data;
    if (this._flags & this.FLAG_LINE_BUFFERED) {
      // only scan the new data for linefeed, to avoid wasting time.
      var last_newline_pos = data.lastIndexOf('\n');
      if (last_newline_pos >= 0) {
        var wbuf = this._wbuffer;
        last_newline_pos += wbuf.length - data.length;
        this._write_all(wbuf.substring(0, last_newline_pos + 1), callback);
        this._wbuffer = "";
        this._wbuffer += wbuf.substring(last_newline_pos + 1);
      }
      return;
    }
    // even if we're line buffering, if the buffer has grown past the
    // buffer size, force a flush.
    if (this._wbuffer.length >= this._bufsize) {
      this.flush(callback);
    }
    return;
  },

  /*
    Write a sequence of strings to the file.  The sequence can be any
    iterable object producing strings, typically a list of strings.  (The
    name is intended to match L{readlines}; C{writelines} does not add line
    separators.)

    @param sequence: an iterable sequence of strings.
    @type sequence: sequence
  */
  writelines : function(sequence) {
    for (var x = 0; x < sequence.length; ++x) {
      this.write(sequence[x]);
    }
    return;
  },

  /*
    Identical to C{iter(f)}.  This is a deprecated file interface that
    predates python iterator support.

    @return: an iterator.
    @rtype: iterator
  */
  xreadlines : function() {
    return this;
  },


  //  overrides...


  /*
    I{(subclass override)}
    Read data from the stream.  Return C{None} or raise C{EOFError} to
    indicate EOF.
  */
  _read : function(size) {
    throw new paramikojs.ssh_exception.EOFError();
  },

  /*
    I{(subclass override)}
    Write data into the stream.
  */
  _write : function(data) {
    throw new paramikojs.ssh_exception.IOError('write not implemented');
  },

  /*
    I{(subclass override)}
    Return the size of the file.  This is called from within L{_set_mode}
    if the file is opened in append mode, so the file position can be
    tracked and L{seek} and L{tell} will work correctly.  If the file is
    a stream that can't be randomly accessed, you don't need to override
    this method,
  */
  _get_size : function() {
    return 0;
  },


  //  internals...


  /*
    Subclasses call this method to initialize the BufferedFile.
  */
  _set_mode : function(mode, bufsize) {
    mode = mode || 'r';
    bufsize = bufsize || -1;

    // set bufsize in any event, because it's used for readline().
    this._bufsize = this._DEFAULT_BUFSIZE;
    if (bufsize < 0) {
      // do no buffering by default, because otherwise writes will get
      // buffered in a way that will probably confuse people.
      bufsize = 0;
    }
    if (bufsize == 1) {
      // apparently, line buffering only affects writes.  reads are only
      // buffered if you call readline (directly or indirectly: iterating
      // over a file will indirectly call readline).
      this._flags |= this.FLAG_BUFFERED | this.FLAG_LINE_BUFFERED;
    } else if (bufsize > 1) {
      this._bufsize = bufsize;
      this._flags |= this.FLAG_BUFFERED;
      this._flags &= ~this.FLAG_LINE_BUFFERED;
    } else if (bufsize == 0) {
      // unbuffered
      this._flags &= ~(this.FLAG_BUFFERED | this.FLAG_LINE_BUFFERED);
    }

    if (mode.indexOf('r') != -1 || mode.indexOf('+') != -1) {
      this._flags |= this.FLAG_READ;
    }
    if (mode.indexOf('w') != -1 || mode.indexOf('+') != -1) {
      this._flags |= this.FLAG_WRITE;
    }
    if (mode.indexOf('a') != -1) {
      this._flags |= this.FLAG_WRITE | this.FLAG_APPEND;
      this._size = this._get_size();
      this._pos = this._realpos = this._size;
    }
    if (mode.indexOf('b') != -1) {
      this._flags |= this.FLAG_BINARY;
    }
    if (mode.indexOf('U') != -1) {
      this._flags |= this.FLAG_UNIVERSAL_NEWLINE;
      // built-in file objects have this attribute to store which kinds of
      // line terminations they've seen:
      // <http://www.python.org/doc/current/lib/built-in-funcs.html>
      this.newlines = null;
    }
  },

  _write_all : function(data, callback) {
    // the underlying stream may be something that does partial writes (like
    // a socket).
    while (data.length > 0) {
      var count = this._write(data, callback, data.length);
      data = data.substring(count);
      if (this._flags & this.FLAG_APPEND) {
        this._size += count;
        this._pos = this._realpos = this._size;
      } else {
        this._pos += count;
        this._realpos += count;
      }
    }
    /*if (callback) {
      callback();
    }*/
    return null;
  },

  _record_newline : function(newline) {
    // todo transcode if necessary
    /*
    # silliness about tracking what kinds of newlines we've seen.
    # i don't understand why it can be None, a string, or a tuple, instead
    # of just always being a tuple, but we'll emulate that behavior anyway.
    if not (self._flags & self.FLAG_UNIVERSAL_NEWLINE):
        return
    if self.newlines is None:
        self.newlines = newline
    elif (type(self.newlines) is str) and (self.newlines != newline):
        self.newlines = (self.newlines, newline)
    elif newline not in self.newlines:
        self.newlines += (newline,)
    */
  }
};

// Source: hostkeys.js
/*
  Representation of a line in an OpenSSH-style "known hosts" file.
*/
paramikojs.HostKeyEntry = function(hostnames, key) {
  this.valid = hostnames && key;
  this.hostnames = hostnames;
  this.key = key;
};

paramikojs.HostKeyEntry.prototype = {
  /*
    Parses the given line of text to find the names for the host,
    the type of key, and the key data. The line is expected to be in the
    format used by the openssh known_hosts file.

    Lines are expected to not have leading or trailing whitespace.
    We don't bother to check for comments or empty lines.  All of
    that should be taken care of before sending the line to us.

    @param line: a line from an OpenSSH known_hosts file
    @type line: str
  */
  from_line : function(line) {
    var fields = line.split(' ');
    if (fields.length < 3) {
      // Bad number of fields
      return null;
    }
    fields = fields.slice(0, 3);

    var names = fields[0];
    var keytype = fields[1];
    var key = fields[2];
    names = names.split(',');

    // Decide what kind of key we're looking at and create an object
    // to hold it accordingly.
    if (keytype == 'ssh-rsa') {
      key = new paramikojs.RSAKey(null, base64.decodestring(key));
    } else if (keytype == 'ssh-dss') {
      key = new paramikojs.DSSKey(null, base64.decodestring(key));
    } else {
      key = new paramikojs.UnknownKey(keytype, base64.decodestring(key));
    }

    return new paramikojs.HostKeyEntry(names, key);
  },

  /*
    Returns a string in OpenSSH known_hosts file format, or None if
    the object is not in a valid state.  A trailing newline is
    included.
  */
  to_line : function() {
    if (this.valid) {
      return this.hostnames.join(',') + ' ' + this.key.get_name() + ' ' + this.key.get_base64() + '\n';
    }
    return null;
  }
};


/*
  Representation of an openssh-style "known hosts" file.  Host keys can be
  read from one or more files, and then individual hosts can be looked up to
  verify server keys during SSH negotiation.

  A HostKeys object can be treated like a dict; any dict lookup is equivalent
  to calling L{lookup}.

  @since: 1.5.3
*/
paramikojs.HostKeys = function(filename) {
  /*
    Create a new HostKeys object, optionally loading keys from an openssh
    style host-key file.

    @param filename: filename to load host keys from, or C{None}
    @type filename: str
  */
  // emulate a dict of { hostname: { keytype: PKey } }
  this._entries = [];
  if (filename) {
    this.load(filename);
  }
};

paramikojs.HostKeys.prototype = {
  /*
    Add a host key entry to the table.  Any existing entry for a
    C{(hostname, keytype)} pair will be replaced.

    @param hostname: the hostname (or IP) to add
    @type hostname: str
    @param keytype: key type (C{"ssh-rsa"} or C{"ssh-dss"})
    @type keytype: str
    @param key: the key to add
    @type key: L{PKey}
  */
  add : function(hostname, keytype, key) {
    for (var x = 0; x < this._entries.length; ++x) {
      if (this._entries[x].hostnames.indexOf(hostname) != -1 && this._entries[x].key.get_name() == keytype) {
        this._entries[x].key = key;
        return;
      }
    }
    this._entries.push(new paramikojs.HostKeyEntry([hostname], key));
  },

  /*
    Read a file of known SSH host keys, in the format used by openssh.
    This type of file unfortunately doesn't exist on Windows, but on
    posix, it will usually be stored in
    C{os.path.expanduser("~/.ssh/known_hosts")}.

    If this method is called multiple times, the host keys are merged,
    not cleared.  So multiple calls to C{load} will just call L{add},
    replacing any existing entries and adding new ones.

    @param filename: name of the file to read host keys from
    @type filename: str

    @raise IOError: if there was an error reading the file
  */
  load : function(filename) {
    if ((window.Components && window.Components.classes)) { // Mozilla
      var file = localFile.init(filename);
      if (!file.exists()) {
        this._entries = [];
        return;
      }

      var fstream = window.Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(window.Components.interfaces.nsIFileInputStream);
      fstream.init(file, -1, 0, 0);

      var charset = "UTF-8";
      var is = window.Components.classes["@mozilla.org/intl/converter-input-stream;1"].createInstance(window.Components.interfaces.nsIConverterInputStream);
      is.init(fstream, charset, 1024, 0xFFFD);
      is.QueryInterface(window.Components.interfaces.nsIUnicharLineInputStream);
      this.loadHelper(is);
    } else if (window.app && window.app.bbsCore && window.app.bbsCore.prefs) {
      var prefs = window.app.bbsCore.prefs;
      is = prefs.loadPrefsValue("host_keys");
      is = value.host_keys || '';
      this.loadHelper(is);
    } else {  // Chrome
      var self = this;
      chrome.storage.local.get("host_keys", function(value) {
        is = value.host_keys || '';
        self.loadHelper(is);
      });
    }
  },

  loadHelper : function(is) {
    var line = {};
    var cont;
    do {
      line = {};
      if ((window.Components && window.Components.classes)) { // Mozilla
        cont = is.readLine(line);
        line = line.value.trim();
      } else {  // Chrome
        line = is.substring(0, is.indexOf('\n'));
        is = is.substring(line.length + 1);
        line = line.trim();
        cont = line.length;
      }
      if (!line.length || line[0] == '#') {
        continue;
      }
      var e = new paramikojs.HostKeyEntry().from_line(line);
      if (e) {
        this._entries.push(e);
      }
      // Now you can do something with line.value
    } while (cont);

    if ((window.Components && window.Components.classes)) {
      is.close();
    }
  },

  /*
    Save host keys into a file, in the format used by openssh.  The order of
    keys in the file will be preserved when possible (if these keys were
    loaded from a file originally).  The single exception is that combined
    lines will be split into individual key lines, which is arguably a bug.

    @param filename: name of the file to write
    @type filename: str

    @raise IOError: if there was an error writing the file

    @since: 1.6.1
  */
  save : function(filename) {
    if ((window.Components && window.Components.classes)) { // Mozilla
      var file = localFile.init(filename);
      var foStream = window.Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(window.Components.interfaces.nsIFileOutputStream);
      foStream.init(file, 0x02 | 0x08 | 0x20, 0644, 0);
      var converter = window.Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(window.Components.interfaces.nsIConverterOutputStream);
      converter.init(foStream, "UTF-8", 0, 0);
    }

    var data = "";
    for (var x = 0; x < this._entries.length; ++x) {
      var line = this._entries[x].to_line();
      if (line) {
        data += line;
      }
    }

    if ((window.Components && window.Components.classes)) { // Mozilla
      converter.writeString(data);
      converter.close();
    } else if (window.app && window.app.bbsCore && window.app.bbsCore.prefs) {
      var prefs = window.app.bbsCore.prefs;
      prefs.savePrefsValue("host_keys", data);
    } else {
      chrome.storage.local.set({'host_keys': data});
    }
  },

  /*
    Find a hostkey entry for a given hostname or IP.  If no entry is found,
    C{None} is returned.  Otherwise a dictionary of keytype to key is
    returned.  The keytype will be either C{"ssh-rsa"} or C{"ssh-dss"}.

    @param hostname: the hostname (or IP) to lookup
    @type hostname: str
    @return: keys associated with this host (or C{None})
    @rtype: dict(str, L{PKey})
  */
  lookup : function(hostname) {
    var entries = {};
    for (var x = 0; x < this._entries.length; ++x) {
      for (var y = 0; y < this._entries[x].hostnames.length; ++y) {
        var h = this._entries[x].hostnames[y];
        if ((h.indexOf('|1|') == 0 && this.hash_host(hostname, h) == h) || h == hostname) {
          entries[this._entries[x].key.get_name()] = this._entries[x].key;
        }
      }
    }
    return entries;
  },

  get : function(hostname) {
    return this.lookup(hostname);
  },

  /*
    Return True if the given key is associated with the given hostname
    in this dictionary.

    @param hostname: hostname (or IP) of the SSH server
    @type hostname: str
    @param key: the key to check
    @type key: L{PKey}
    @return: C{True} if the key is associated with the hostname; C{False}
        if not
    @rtype: bool
  */
  check : function(hostname, key) {
    var k = this.lookup(hostname);
    if (!k) {
      return false;
    }
    var host_key = k.get(key.get_name(), null);
    if (!host_key) {
      return false;
    }
    return host_key.toString() == key.toString();
  },

  /*
    Remove all host keys from the dictionary.
  */
  clear : function() {
    this._entries = [];
  },

  keys : function() {
    var ret = [];
    for (var x = 0; x < this._entries.length; ++x) {
      for (var y = 0; y < this._entries[x].hostnames.length; ++y) {
        var h = this._entries[x].hostnames[y];
        if (ret.indexOf(h) == -1) {
          ret.push(h);
        }
      }
    }
    return ret;
  },

  values : function() {
    var ret = [];
    var keys = this.keys();
    for (var x; x < keys.length; ++x) {
      ret.push(this.lookup(keys[x]));
    }
    return ret;
  },

  /*
    Return a "hashed" form of the hostname, as used by openssh when storing
    hashed hostnames in the known_hosts file.

    @param hostname: the hostname to hash
    @type hostname: str
    @param salt: optional salt to use when hashing (must be 20 bytes long)
    @type salt: str
    @return: the hashed hostname
    @rtype: str
  */
  hash_host : function(hostname, salt) {
    if (!salt) {
      salt = paramikojs.rng.read(kryptos.hash.SHA.digest_size);
    } else {
      if (salt.indexOf('|1|') == 0) {
        salt = salt.split('|')[2];
      }
      salt = base64.decodestring(salt);
    }
    var hmac = kryptos.hash.HMAC(salt, hostname, kryptos.hash.HMAC_SHA);
    var hostkey = '|1|' + base64.encodestring(salt) + '|' + base64.encodestring(hmac);
    return hostkey.replace('\n', '');
  }
};

// Source: kex_gex.js
/*
  Variant on L{KexGroup1 <paramiko.kex_group1.KexGroup1>} where the prime "p" and
  generator "g" are provided by the server.  A bit more work is required on the
  client side, and a B{lot} more on the server side.
*/

paramikojs.KexGex = function(transport) {
  this.transport = transport;
  this.p = null;
  this.q = null;
  this.g = null;
  this.x = null;
  this.e = null;
  this.f = null;
  this.old_style = false;
};


paramikojs.KexGex._MSG_KEXDH_GEX_REQUEST_OLD = 30;
paramikojs.KexGex._MSG_KEXDH_GEX_GROUP = 31;
paramikojs.KexGex._MSG_KEXDH_GEX_INIT = 32;
paramikojs.KexGex._MSG_KEXDH_GEX_REPLY = 33;
paramikojs.KexGex._MSG_KEXDH_GEX_REQUEST = 34;

paramikojs.KexGex.prototype = {
  name : 'diffie-hellman-group-exchange-sha1',
  min_bits : 1024,
  max_bits : 8192,
  preferred_bits : 2048,

  start_kex : function(_test_old_style) {
    if (this.transport.server_mode) {
      this.transport._expect_packet(paramikojs.KexGex._MSG_KEXDH_GEX_REQUEST, paramikojs.KexGex._MSG_KEXDH_GEX_REQUEST_OLD);
      return;
    }
    // request a bit range: we accept (min_bits) to (max_bits), but prefer
    // (preferred_bits).  according to the spec, we shouldn't pull the
    // minimum up above 1024.
    var m = new paramikojs.Message();
    if (_test_old_style) {
      // only used for unit tests: we shouldn't ever send this
      m.add_byte(String.fromCharCode(paramikojs.KexGex._MSG_KEXDH_GEX_REQUEST_OLD));
      m.add_int(this.preferred_bits);
      this.old_style = true;
    } else {
      m.add_byte(String.fromCharCode(paramikojs.KexGex._MSG_KEXDH_GEX_REQUEST));
      m.add_int(this.min_bits);
      m.add_int(this.preferred_bits);
      m.add_int(this.max_bits);
    }
    this.transport._send_message(m);
    this.transport._expect_packet(paramikojs.KexGex._MSG_KEXDH_GEX_GROUP);
  },

  parse_next : function(ptype, m) {
    if (ptype == paramikojs.KexGex._MSG_KEXDH_GEX_GROUP) {
      return this._parse_kexdh_gex_group(m);
    } else if (ptype == paramikojs.KexGex._MSG_KEXDH_GEX_REPLY) {
      return this._parse_kexdh_gex_reply(m);
    }
    throw new paramikojs.ssh_exception.SSHException('KexGex asked to handle packet type ' + ptype);
  },


  //  internals...

  _generate_x : function() {
    // generate an "x" (1 < x < (p-1)/2).
    var one = BigInteger.ONE;
    var q = this.p.subtract(one);
    q = q.divide(new BigInteger("2", 10));
    var qnorm = paramikojs.util.deflate_long(q, 0);
    var qhbyte = qnorm[0].charCodeAt(0);
    var bytes = qnorm.length;
    var qmask = 0xff;
    while (!(qhbyte & 0x80)) {
      qhbyte <<= 1;
      qmask >>= 1;
    }
    var x;
    while (true) {
      var x_bytes = this.transport.rng.read(bytes);
      x_bytes = String.fromCharCode(x_bytes[0].charCodeAt(0) & qmask) + x_bytes.substring(1);
      x = paramikojs.util.inflate_long(x_bytes, 1);
      if (x.compareTo(one) > 0 && q.compareTo(x) > 0) {
        break;
      }
    }
    this.x = x;
  },

  _parse_kexdh_gex_group : function(m) {
    this.p = m.get_mpint();
    this.g = m.get_mpint();
    // reject if p's bit length < 1024 or > 8192
    var bitlen = paramikojs.util.bit_length(this.p);
    if (bitlen < 1024 || bitlen > 8192) {
      throw new paramikojs.ssh_exception.SSHException('Server-generated gex p (don\'t ask) is out of range (' + bitlen + ' bits)');
    }
    if(ssh_console.debug) console.debug('Got server p (' + bitlen + ' bits)');
    this._generate_x();
    // now compute e = g^x mod p
    this.e = this.g.modPow(this.x, this.p);
    m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.KexGex._MSG_KEXDH_GEX_INIT));
    m.add_mpint(this.e);
    this.transport._send_message(m);
    this.transport._expect_packet(paramikojs.KexGex._MSG_KEXDH_GEX_REPLY);
  },

  _parse_kexdh_gex_reply : function(m) {
    var host_key = m.get_string();
    this.f = m.get_mpint();
    var sig = m.get_string();
    var one = BigInteger.ONE;
    if (one.compareTo(this.f) > 0 || this.f.compareTo(this.p.subtract(one)) > 0) {
      throw new paramikojs.ssh_exception.SSHException('Server kex "f" is out of range');
    }
    var K = this.f.modPow(this.x, this.p);
    // okay, build up the hash H of (V_C || V_S || I_C || I_S || K_S || min || n || max || p || g || e || f || K)
    var hm = new paramikojs.Message();
    hm.add(this.transport.local_version, this.transport.remote_version,
           this.transport.local_kex_init, this.transport.remote_kex_init,
           host_key);
    if (!this.old_style) {
      hm.add_int(this.min_bits);
    }
    hm.add_int(this.preferred_bits);
    if (!this.old_style) {
      hm.add_int(this.max_bits);
    }
    hm.add_mpint(this.p);
    hm.add_mpint(this.g);
    hm.add_mpint(this.e);
    hm.add_mpint(this.f);
    hm.add_mpint(K);
    this.transport._set_K_H(K, new kryptos.hash.SHA(hm.toString()).digest());
    this.transport._verify_key(host_key, sig);
    this.transport._activate_outbound();
  }
};

// Source: kex_group1.js
/*
  Standard SSH key exchange ("kex" if you wanna sound cool).  Diffie-Hellman of
  1024 bit key halves, using a known "p" prime and "g" generator.
*/

paramikojs.KexGroup1 = function(transport) {
  this.transport = transport;
  this.x = new BigInteger("0", 10);
  this.e = new BigInteger("0", 10);
  this.f = new BigInteger("0", 10);

  this.P = paramikojs.KexGroup1.P;
  this.G = paramikojs.KexGroup1.G;
};

paramikojs.KexGroup1._MSG_KEXDH_INIT = 30;
paramikojs.KexGroup1._MSG_KEXDH_REPLY = 31;

// draft-ietf-secsh-transport-09.txt, page 17
paramikojs.KexGroup1.P = new BigInteger("FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE65381FFFFFFFFFFFFFFFF", 16);
paramikojs.KexGroup1.G = new BigInteger("2", 10);

paramikojs.KexGroup1.prototype = {
  name : 'diffie-hellman-group1-sha1',

  start_kex : function() {
    this._generate_x();
    if (this.transport.server_mode) {
      // compute f = g^x mod p, but don't send it yet
      this.f = this.G.modPow(this.x, this.P);
      this.transport._expect_packet(paramikojs.KexGroup1._MSG_KEXDH_INIT);
      return;
    }
    // compute e = g^x mod p (where g=2), and send it
    this.e = this.G.modPow(this.x, this.P);
    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.KexGroup1._MSG_KEXDH_INIT));
    m.add_mpint(this.e);
    this.transport._send_message(m);
    this.transport._expect_packet(paramikojs.KexGroup1._MSG_KEXDH_REPLY);
  },

  parse_next : function(ptype, m) {
    if (this.transport.server_mode && ptype == paramikojs.KexGroup1._MSG_KEXDH_INIT) {
      return this._parse_kexdh_init(m);
    } else if (!this.transport.server_mode && ptype == paramikojs.KexGroup1._MSG_KEXDH_REPLY) {
      return this._parse_kexdh_reply(m);
    }
    throw new paramikojs.ssh_exception.SSHException('KexGroup1 asked to handle packet type ' + ptype);
  },


  //  internals...

  _generate_x : function() {
    // generate an "x" (1 < x < q), where q is (p-1)/2.
    // p is a 128-byte (1024-bit) number, where the first 64 bits are 1.
    // therefore q can be approximated as a 2^1023.  we drop the subset of
    // potential x where the first 63 bits are 1, because some of those will be
    // larger than q (but this is a tiny tiny subset of potential x).
    var x_bytes;
    while (true) {
      x_bytes = this.transport.rng.read(128);
      x_bytes = String.fromCharCode(x_bytes[0].charCodeAt(0) & 0x7f) + x_bytes.substring(1);
      if (x_bytes.substring(0, 8) != '\x7F\xFF\xFF\xFF\xFF\xFF\xFF\xFF' && x_bytes.substring(0, 8) != '\x00\x00\x00\x00\x00\x00\x00\x00') {
        break;
      }
    }
    this.x = paramikojs.util.inflate_long(x_bytes, false);
  },

  _parse_kexdh_reply : function(m) {
    // client mode
    var host_key = m.get_string();
    this.f = m.get_mpint();
    var one = BigInteger.ONE;
    if (one.compareTo(this.f) > 0 || this.f.compareTo(this.P.subtract(one)) > 0) {
      throw new paramikojs.ssh_exception.SSHException('Server kex "f" is out of range');
    }
    var sig = m.get_string();
    var K = this.f.modPow(this.x, this.P);
    // okay, build up the hash H of (V_C || V_S || I_C || I_S || K_S || e || f || K)
    var hm = new paramikojs.Message();
    hm.add(this.transport.local_version, this.transport.remote_version,
           this.transport.local_kex_init, this.transport.remote_kex_init);
    hm.add_string(host_key);
    hm.add_mpint(this.e);
    hm.add_mpint(this.f);
    hm.add_mpint(K);
    this.transport._set_K_H(K, new kryptos.hash.SHA(hm.toString()).digest());
    this.transport._verify_key(host_key, sig);
    this.transport._activate_outbound();
  }

};

// Source: kex_group14.js
/*
  Copyright (C) 2013  Torsten Landschoff <torsten@debian.org>

  Standard SSH key exchange ("kex" if you wanna sound cool).  Diffie-Hellman of
  2048 bit key halves, using a known "p" prime and "g" generator.
*/

paramikojs.KexGroup14 = function(transport) {
  inherit(this, new paramikojs.KexGroup1(transport));

  this.P = paramikojs.KexGroup14.P;
  this.G = paramikojs.KexGroup14.G;
};

// http://tools.ietf.org/html/rfc3526#section-3
paramikojs.KexGroup14.P = new BigInteger("FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AACAA68FFFFFFFFFFFFFFFF", 16);
paramikojs.KexGroup14.G = new BigInteger("2", 10);

paramikojs.KexGroup14.prototype = {
  name : 'diffie-hellman-group14-sha1'
};

// Source: message.js
/*
  Implementation of an SSH2 "message".

  An SSH2 I{Message} is a stream of bytes that encodes some combination of
  strings, integers, bools, and infinite-precision integers (known in python
  as I{long}s).  This class builds or breaks down such a byte stream.

  Normally you don't need to deal with anything this low-level, but it's
  exposed for people implementing custom extensions, or features that
  paramiko doesn't support yet.
*/

paramikojs.Message = function(content) {
  /*
    Create a new SSH2 Message.

    @param content: the byte stream to use as the Message content (passed
        in only when decomposing a Message).
    @type content: string
  */
  if (content) {
    this.packet = new String(content);
  } else {
    this.packet = new String();
  }
  this.position = 0;
};

paramikojs.Message.prototype = {
  toString : function() {
    return this.packet;
  },

  /*
    Rewind the message to the beginning as if no items had been parsed
    out of it yet.
  */
  rewind : function() {
    this.position = 0;
  },

  /*
    Return the bytes of this Message that haven't already been parsed and
    returned.

    @return: a string of the bytes not parsed yet.
    @rtype: string
  */
  get_remainder : function() {
    return this.packet.substring(this.position);
  },

  /*
    Returns the bytes of this Message that have been parsed and returned.
    The string passed into a Message's constructor can be regenerated by
    concatenating C{get_so_far} and L{get_remainder}.

    @return: a string of the bytes parsed so far.
    @rtype: string
  */
  get_so_far : function() {
    return this.packet.substring(0, this.position);
  },

  /*
    Return the next C{n} bytes of the Message, without decomposing into
    an int, string, etc.  Just the raw bytes are returned.

    @return: a string of the next C{n} bytes of the Message, or a string
        of C{n} zero bytes, if there aren't C{n} bytes remaining.
    @rtype: string
  */
  get_bytes : function(n) {
    var b = this.packet.substring(this.position, this.position + n);
    this.position += n;
    var max_pad_size = 1 << 20;  // Limit padding to 1 MB
    if (b.length < n && n < max_pad_size) {
      return b + new Array(n - b.length + 1).join('\x00');
    }
    return b;
  },

  /*
    Return the next byte of the Message, without decomposing it.  This
    is equivalent to L{get_bytes(1)<get_bytes>}.

    @return: the next byte of the Message, or C{'\000'} if there aren't
        any bytes remaining.
    @rtype: string
  */
  get_byte : function() {
    return this.get_bytes(1);
  },

  /*
    Fetch a boolean from the stream.

    @return: C{True} or C{False} (from the Message).
    @rtype: bool
  */
  get_boolean : function() {
    var b = this.get_bytes(1);
    return b != '\x00';
  },

  /*
    Fetch an int from the stream.

    @return: a 32-bit unsigned integer.
    @rtype: int
  */
  get_int : function() {
    return struct.unpack('>I', this.get_bytes(4))[0];
  },

  /*
    Fetch a 64-bit int from the stream.

    @return: a 64-bit unsigned integer.
    @rtype: long
  */
  get_int64 : function() {
    return struct.unpack('>Q', this.get_bytes(8))[0];
  },

  /*
    Fetch a long int (mpint) from the stream.

    @return: an arbitrary-length integer.
    @rtype: long
  */
  get_mpint : function() {
    return paramikojs.util.inflate_long(this.get_string());
  },

  /*
    Fetch a string from the stream.  This could be a byte string and may
    contain unprintable characters.  (It's not unheard of for a string to
    contain another byte-stream Message.)

    @return: a string.
    @rtype: string
  */
  get_string : function() {
    return this.get_bytes(this.get_int());
  },

  /*
    Fetch a list of strings from the stream.  These are trivially encoded
    as comma-separated values in a string.

    @return: a list of strings.
    @rtype: list of strings
  */
  get_list : function() {
    return this.get_string().split(',');
  },

  /*
    Write bytes to the stream, without any formatting.

    @param b: bytes to add
    @type b: str
  */
  add_bytes : function(b) {
    this.packet += b;
    return this;
  },

  /*
    Write a single byte to the stream, without any formatting.

    @param b: byte to add
    @type b: str
  */
  add_byte : function(b) {
    this.packet += b;
    return this;
  },

  /*
    Add a boolean value to the stream.

    @param b: boolean value to add
    @type b: bool
  */
  add_boolean : function(b) {
    if (b) {
      this.add_byte('\x01');
    } else {
      this.add_byte('\x00');
    }
    return this;
  },

  /*
    Add an integer to the stream.

    @param n: integer to add
    @type n: int
  */
  add_int : function(n) {
    this.packet += struct.pack('>I', n);
    return this;
  },

  /*
    Add a 64-bit int to the stream.

    @param n: long int to add
    @type n: long
  */
  add_int64 : function(n) {
    this.packet += struct.pack('>Q', n);
    return this;
  },

  /*
    Add a long int to the stream, encoded as an infinite-precision
    integer.  This method only works on positive numbers.

    @param z: long int to add
    @type z: long
  */
  add_mpint : function(z) {
    this.add_string(paramikojs.util.deflate_long(z));
    return this;
  },

  /*
    Add a string to the stream.

    @param s: string to add
    @type s: str
  */
  add_string : function(s) {
    this.add_int(s.length);
    this.packet += s;
    return this;
  },

  /*
    Add a list of strings to the stream.  They are encoded identically to
    a single string of values separated by commas.  (Yes, really, that's
    how SSH2 does it.)

    @param l: list of strings to add
    @type l: list(str)
  */
  add_list : function(l) {
    this.add_string(l.join(','));
    return this;
  },

  _add : function(i) {
    if (typeof i == "string") {
      return this.add_string(i);
    } else if (typeof i == "number") {
      return this.add_int(i);
    } else if (i instanceof BigInteger) {
      return this.add_mpint(i);
    } else if (typeof i == "boolean") {
      return this.add_boolean(i);
    } else if (i instanceof Array) {
      return this.add_list(i);
    } else {
      throw 'Unknown type';
    }
  },

  /*
    Add a sequence of items to the stream.  The values are encoded based
    on their type: str, int, bool, list, or long.

    @param seq: the sequence of items
    @type seq: sequence

    @bug: longs are encoded non-deterministically.  Don't use this method.
  */
  add : function() {
    for (var x = 0; x < arguments.length; ++x) {
      this._add(arguments[x]);
    }
  }
};

// Source: packet.js
/*
  Implementation of the base SSH packet protocol.
*/

paramikojs.Packetizer = function(socket) {
  this.__socket = socket;
  this.__closed = false;
  this.__dump_packets = false;
  this.__need_rekey = false;
  this.__init_count = 0;
  this.__remainder = '';
  this.__decrypted_header = '';

  // used for noticing when to re-key:
  this.__sent_bytes = 0;
  this.__sent_packets = 0;
  this.__received_bytes = 0;
  this.__received_packets = 0;
  this.__received_packets_overflow = 0;

  // current inbound/outbound ciphering:
  this.__block_size_out = 8;
  this.__block_size_in = 8;
  this.__mac_size_out = 0;
  this.__mac_size_in = 0;
  this.__block_engine_out = null;
  this.__block_engine_in = null;
  this.__mac_engine_out = null;
  this.__mac_engine_in = null;
  this.__mac_key_out = '';
  this.__mac_key_in = '';
  this.__compress_engine_out = null;
  this.__compress_engine_in = null;
  this.__sequence_number_out = 0;
  this.__sequence_number_in = 0;

  // keepalives:
  this.__keepalive_interval = 0;
  this.__keepalive_last = new Date();
  this.__keepalive_callback = null;
};

paramikojs.Packetizer.prototype = {
	// READ the secsh RFC's before raising these values.  if anything,
  // they should probably be lower.
  REKEY_PACKETS : Math.pow(2, 29),
  REKEY_BYTES : Math.pow(2, 29),
  REKEY_PACKETS_OVERFLOW_MAX : Math.pow(2, 29),   // Allow receiving this many packets after a re-key request before terminating
  REKEY_BYTES_OVERFLOW_MAX : Math.pow(2, 29),     // Allow receiving this many bytes after a re-key request before terminating

  /*
    Switch outbound data cipher.
  */
  set_outbound_cipher : function(block_engine, block_size, mac_engine, mac_size, mac_key) {
    this.__block_engine_out = block_engine;
    this.__block_size_out = block_size;
    this.__mac_engine_out = mac_engine;
    this.__mac_size_out = mac_size;
    this.__mac_key_out = mac_key;
    this.__sent_bytes = 0;
    this.__sent_packets = 0;
    // wait until the reset happens in both directions before clearing rekey flag
    this.__init_count |= 1;
    if (this.__init_count == 3) {
      this.__init_count = 0;
      this.__need_rekey = false;
    }
  },

  /*
    Switch inbound data cipher.
  */
  set_inbound_cipher : function(block_engine, block_size, mac_engine, mac_size, mac_key) {
    this.__block_engine_in = block_engine;
    this.__block_size_in = block_size;
    this.__mac_engine_in = mac_engine;
    this.__mac_size_in = mac_size;
    this.__mac_key_in = mac_key;
    this.__received_bytes = 0;
    this.__received_packets = 0;
    this.__received_bytes_overflow = 0;
    this.__received_packets_overflow = 0;
    // wait until the reset happens in both directions before clearing rekey flag
    this.__init_count |= 2;
    if (this.__init_count == 3) {
      this.__init_count = 0;
      this.__need_rekey = false;
    }
  },

  set_outbound_compressor : function(compressor) {
    this.__compress_engine_out = compressor;
  },

  set_inbound_compressor : function(compressor) {
    this.__compress_engine_in = compressor;
  },

  close : function() {
    this.__closed = true;
  },

  set_hexdump : function(hexdump) {
    this.__dump_packets = hexdump;
  },

  get_hexdump : function() {
    return this.__dump_packets;
  },

  get_mac_size_in : function() {
    return this.__mac_size_in;
  },

  get_mac_size_out : function() {
    return this.__mac_size_out;
  },

  /*
    Returns C{True} if a new set of keys needs to be negotiated.  This
    will be triggered during a packet read or write, so it should be
    checked after every read or write, or at least after every few.

    @return: C{True} if a new set of keys needs to be negotiated
  */
  need_rekey : function() {
    return this.__need_rekey;
  },

  /*
    Turn on/off the callback keepalive.  If C{interval} seconds pass with
    no data read from or written to the socket, the callback will be
    executed and the timer will be reset.
  */
  set_keepalive : function(interval, callback) {
    this.__keepalive_interval = interval;
    this.__keepalive_callback = callback;
    this.__keepalive_last = new Date();
  },

  /*
    Read as close to N bytes as possible, blocking as long as necessary.

    @param n: number of bytes to read
    @type n: int
    @return: the data read
    @rtype: str
    @raise EOFError: if the socket was closed before all the bytes could
        be read
  */
  read_all : function(n, check_rekey) {
    //if (this.__remainder.length + this.__socket.fullBuffer.length < n) {
    if (this.__socket.fullBuffer.length < n) {
      throw new paramikojs.ssh_exception.WaitException("wait");
    }

    var out = '';
    // handle over-reading from reading the banner line
    /*if (this.__remainder.length > 0) {
      out = this.__remainder.substring(0, n);
      this.__remainder = this.__remainder.substring(n);
      n -= out.length;
    }*/
    out += this.__socket.fullBuffer.substring(0, n);
    this.__socket.fullBuffer = this.__socket.fullBuffer.substring(n);
    return out;
  },

  write_all : function(out) {
    this.__keepalive_last = new Date();
    //this.__socket.writeControl(out);
    this.__socket.writeCallback(out);
  },

  /*
    Read a line from the socket.  We assume no data is pending after the
    line, so it's okay to attempt large reads.
  */
  readline : function(timeout) {
    //var buf = this.__remainder;
    var buf = '';
    while (buf.indexOf('\n') == -1) {
      buf += this._read_timeout(timeout);
    }
    var n = buf.indexOf('\n');
    this.__socket.fullBuffer = buf.substring(n + 1) + this.__socket.fullBuffer;
    buf = buf.substring(0, n);
    if (buf.length > 0 && buf.charAt(buf.length - 1) == '\r') {
      buf = buf.substring(0, buf.length - 1);
    }
    return buf;
  },

  /*
    Write a block of data using the current cipher, as an SSH block.
  */
  send_message : function(data) {
    // encrypt this sucka
    data = data.toString();
    var cmd = data[0].charCodeAt(0);
    var cmd_name;
    if (cmd in paramikojs.MSG_NAMES) {
      cmd_name = paramikojs.MSG_NAMES[cmd];
    } else {
      cmd_name = '$' + cmd;
    }
    var orig_len = data.length;
    if (this.__compress_engine_out) {
      data = this.__compress_engine_out.compress(data);
    }
    var packet = this._build_packet(data);
    if (this.__dump_packets) {
      if(ssh_console.debug) console.debug('Write packet <' + cmd_name + '>, length ' + orig_len);
      if(ssh_console.debug) console.debug(paramikojs.util.format_binary(packet, 'OUT: '));
    }
    var out;
    if (this.__block_engine_out) {
      out = this.__block_engine_out.encrypt(packet);
    } else {
      out = packet;
    }

    // + mac
    var payload;
    if (this.__block_engine_out) {
      payload = struct.pack('>I', this.__sequence_number_out) + packet;
      out += kryptos.hash.HMAC(this.__mac_key_out, payload, this.__mac_engine_out).substring(0, this.__mac_size_out);
    }
    this.__sequence_number_out = (this.__sequence_number_out + 1) & 0xffffffff;
    this.write_all(out);

    this.__sent_bytes += out.length;
    this.__sent_packets += 1;
    if ((this.__sent_packets >= this.REKEY_PACKETS || this.__sent_bytes >= this.REKEY_BYTES)
           && !this.__need_rekey) {
      // only ask once for rekeying
      if(ssh_console.debug) console.debug('Rekeying (hit ' + this.__sent_packets + ' packets, ' + this.__sent_bytes + ' bytes sent)');
      this.__received_bytes_overflow = 0;
      this.__received_packets_overflow = 0;
      this._trigger_rekey();
    }
  },

  /*
    Only one thread should ever be in this function (no other locking is
    done).

    @raise SSHException: if the packet is mangled
    @raise NeedRekeyException: if the transport should rekey
  */
  read_message : function() {
    var header;
    if (!this.__decrypted_header) {
      header = this.read_all(this.__block_size_in, true);
      if (this.__block_engine_in) {
        header = this.__block_engine_in.decrypt(header);
      }
      if (this.__dump_packets) {
        if(ssh_console.debug) console.debug(paramikojs.util.format_binary(header, 'IN: '));
      }
    } else {
      header = this.__decrypted_header;
      this.__decrypted_header = '';
    }

    var packet_size = struct.unpack('>I', header.substring(0, 4))[0];
    // leftover contains decrypted bytes from the first block (after the length field)
    var leftover = header.substring(4);
    if ((packet_size - leftover.length) % this.__block_size_in != 0) {
      throw new paramikojs.ssh_exception.SSHException('Invalid packet blocking');
    }

    var buf;
    try {
      buf = this.read_all(packet_size + this.__mac_size_in - leftover.length);
    } catch(ex) {
      if (ex instanceof paramikojs.ssh_exception.WaitException) {
        // not enough data yet to complete the packet
        this.__decrypted_header = header;
        throw new paramikojs.ssh_exception.WaitException("wait"); // rethrow exception
      } else {
        throw ex;
      }
    }

    var packet = buf.substring(0, packet_size - leftover.length);
    var post_packet = buf.substring(packet_size - leftover.length);
    if (this.__block_engine_in && packet) {
      packet = this.__block_engine_in.decrypt(packet);
    }
    if (this.__dump_packets) {
      if(ssh_console.debug) console.debug(paramikojs.util.format_binary(packet, 'IN: '));
    }
    packet = leftover + packet;

    if (this.__mac_size_in > 0) {
      var mac = post_packet.substring(0, this.__mac_size_in);
      var mac_payload = struct.pack('>I', this.__sequence_number_in) + struct.pack('>I', packet_size) + packet;
      var my_mac = kryptos.hash.HMAC(this.__mac_key_in, mac_payload, this.__mac_engine_in).substring(0, this.__mac_size_in);
      if (my_mac != mac) {
        throw new paramikojs.ssh_exception.SSHException('Mismatched MAC');
      }
    }
    var padding = packet[0].charCodeAt(0);
    var payload = packet.substring(1, packet_size - padding);
    if (this.__dump_packets) {
      if(ssh_console.debug) console.debug('Got payload (' + packet_size + ' bytes, ' + padding + ' padding)');
    }

    if (this.__compress_engine_in) {
      payload = this.__compress_engine_in.decompress(payload);
    }

    var msg = new paramikojs.Message(payload.substring(1));
    msg.seqno = this.__sequence_number_in;
    this.__sequence_number_in = (this.__sequence_number_in + 1) & 0xffffffff;

    // check for rekey
    var raw_packet_size = packet_size + this.__mac_size_in + 4;
    this.__received_bytes += raw_packet_size;
    this.__received_packets += 1;
    if (this.__need_rekey) {
      // we've asked to rekey -- give them some packets to comply before
      // dropping the connection
      this.__received_bytes_overflow += raw_packet_size;
      this.__received_packets_overflow += 1;
      if (this.__received_packets_overflow >= this.REKEY_PACKETS_OVERFLOW_MAX ||
          this.__received_bytes_overflow >= this.REKEY_BYTES_OVERFLOW_MAX) {
        throw new paramikojs.ssh_exception.SSHException('Remote transport is ignoring rekey requests');
      }
    } else if (this.__received_packets >= this.REKEY_PACKETS ||
      this.__received_bytes >= this.REKEY_BYTES) {
      // only ask once for rekeying
      if(ssh_console.debug) console.debug('Rekeying (hit ' + this.__received_packets + ' packets, ' + this.__received_bytes + ' bytes received)');
      this.__received_bytes_overflow = 0;
      this.__received_packets_overflow = 0;
      this._trigger_rekey();
    }

    var cmd = payload[0].charCodeAt(0);
    var cmd_name;
    if (cmd in paramikojs.MSG_NAMES) {
      cmd_name = paramikojs.MSG_NAMES[cmd];
    } else {
      cmd_name = '$' + cmd;
    }
    if (this.__dump_packets) {
      if(ssh_console.debug) console.debug('Read packet <' + cmd_name + '>, length ' + payload.length);
    }
    if (false) {
      this.__socket.run({ 'ptype': cmd, 'm': msg });
    }
    return { 'ptype': cmd, 'm': msg };
  },


  //  protected

  _check_keepalive : function() {
    if (!this.__keepalive_interval || !this.__block_engine_out || this.__need_rekey) {
      // wait till we're encrypting, and not in the middle of rekeying
      return;
    }
    var now = new Date();
    if (now > this.__keepalive_last + this.__keepalive_interval) {
      this.__keepalive_callback();
      this.__keepalive_last = now;
    }
  },

  _read_timeout : function(timeout) {
    var buf = this.__socket.fullBuffer.substring(0, 128);
    this.__socket.fullBuffer = this.__socket.fullBuffer.substring(128);
    return buf;
  },

  _build_packet : function(payload) {
    // pad up at least 4 bytes, to nearest block-size (usually 8)
    var bsize = this.__block_size_out;
    var padding = 3 + bsize - ((payload.length + 8) % bsize);
    var packet = struct.pack('>I', payload.length + padding + 1) + struct.pack('>B', padding);
    packet += payload;
    if (this.__block_engine_out) {
      packet += this.__socket.rng.read(padding, true);
    } else {
      // cute trick i caught openssh doing: if we're not encrypting,
      // don't waste random bytes for the padding
      packet += new Array(padding + 1).join('\x00');
    }
    return packet;
  },

  _trigger_rekey : function() {
    // outside code should check for this flag
    this.__need_rekey = true;
  }

};

// Source: pkey.js
/*
  Base class for public keys.
*/

paramikojs.PKey = function(msg, data) {
/*
  Create a new instance of this public key type.  If C{msg} is given,
  the key's public part(s) will be filled in from the message.  If
  C{data} is given, the key's public part(s) will be filled in from
  the string.

  @param msg: an optional SSH L{Message} containing a public key of this
  type.
  @type msg: L{Message}
  @param data: an optional string containing a public key of this type
  @type data: str

  @raise SSHException: if a key cannot be created from the C{data} or
  C{msg} given, or no key was passed in.
*/
};

paramikojs.PKey.prototype = {
  // known encryption types for private key files:
  _CIPHER_TABLE : {
    'AES-128-CBC': { 'cipher': kryptos.cipher.AES, 'keysize': 16, 'blocksize': 16, 'mode': kryptos.cipher.AES.MODE_CBC },
    'DES-EDE3-CBC': { 'cipher': kryptos.cipher.DES3, 'keysize': 24, 'blocksize': 8, 'mode': kryptos.cipher.DES3.MODE_CBC }
  },

  /*
    Return a string of an SSH L{Message} made up of the public part(s) of
    this key.  This string is suitable for passing to L{__init__} to
    re-create the key object later.

    @return: string representation of an SSH key message.
    @rtype: str
  */
  toString : function() {
    return '';
  },

  /*
    Return the name of this private key implementation.

    @return: name of this private key type, in SSH terminology (for
    example, C{"ssh-rsa"}).
    @rtype: str
  */
  get_name : function() {
    return '';
  },

  /*
    Return the number of significant bits in this key.  This is useful
    for judging the relative security of a key.

    @return: bits in the key.
    @rtype: int
  */
  get_bits : function(self) {
    return 0;
  },

  /*
    Return C{True} if this key has the private part necessary for signing
    data.

    @return: C{True} if this is a private key.
    @rtype: bool
  */
  can_sign : function() {
    return false;
  },

  /*
    Return an MD5 fingerprint of the public part of this key.  Nothing
    secret is revealed.

    @return: a 16-byte string (binary) of the MD5 fingerprint, in SSH
        format.
    @rtype: str
  */
  get_fingerprint : function() {
    return new kryptos.hash.MD5(this.toString()).digest();
  },

  /*
    Return a base64 string containing the public part of this key.  Nothing
    secret is revealed.  This format is compatible with that used to store
    public key files or recognized host keys.

    @return: a base64 string containing the public part of the key.
    @rtype: str
  */
  get_base64 : function() {
    return base64.encodestring(this.toString()).replace('\n', '');
  },

  /*
    Sign a blob of data with this private key, and return a L{Message}
    representing an SSH signature message.

    @param rng: a secure random number generator.
    @type rng: L{Crypto.Util.rng.RandomPool}
    @param data: the data to sign.
    @type data: str
    @return: an SSH signature message.  # mime: changed to callback instead of return to use Worker's
    @rtype: L{Message}
  */
  sign_ssh_data : function(rng, data, callback) {
    callback('');
  },

  /*
    Given a blob of data, and an SSH message representing a signature of
    that data, verify that it was signed with this key.

    @param data: the data that was signed.
    @type data: str
    @param msg: an SSH signature message
    @type msg: L{Message}
    @return: C{True} if the signature verifies correctly; C{False}
        otherwise.
    @rtype: boolean
  */
  verify_ssh_sig : function(data, msg) {
    return false;
  },

  /*
    Create a key object by reading a private key file.  If the private
    key is encrypted and C{password} is not C{None}, the given password
    will be used to decrypt the key (otherwise L{PasswordRequiredException}
    is thrown).  Through the magic of python, this factory method will
    exist in all subclasses of PKey (such as L{RSAKey} or L{DSSKey}), but
    is useless on the abstract PKey class.

    @param filename: name of the file to read
    @type filename: str
    @param password: an optional password to use to decrypt the key file,
        if it's encrypted
    @type password: str
    @return: a new key object based on the given private key
    @rtype: L{PKey}

    @raise IOError: if there was an error reading the file
    @raise PasswordRequiredException: if the private key file is
        encrypted, and C{password} is C{None}
    @raise SSHException: if the key file is invalid
  */
  from_private_key_file : function(filename, password) {
    var key = new this(null, null, filename, password);
    return key;
  },

  /*
    Create a key object by reading a private key from a file (or file-like)
    object.  If the private key is encrypted and C{password} is not C{None},
    the given password will be used to decrypt the key (otherwise
    L{PasswordRequiredException} is thrown).

    @param file_obj: the file to read from
    @type file_obj: file
    @param password: an optional password to use to decrypt the key, if it's
        encrypted
    @type password: str
    @return: a new key object based on the given private key
    @rtype: L{PKey}

    @raise IOError: if there was an error reading the key
    @raise PasswordRequiredException: if the private key file is encrypted,
        and C{password} is C{None}
    @raise SSHException: if the key file is invalid
  */
  from_private_key : function(file_obj, password) {
    var key = new this(null, null, null, password, null, file_obj);
    return key;
  },

  /*
    Write private key contents into a file.  If the password is not
    C{None}, the key is encrypted before writing.

    @param filename: name of the file to write
    @type filename: str
    @param password: an optional password to use to encrypt the key file
    @type password: str

    @raise IOError: if there was an error writing the file
    @raise SSHException: if the key is invalid
  */
  write_private_key_file : function(filename, password) {
    throw 'Not implemented in PKey';
  },

  /*
    Write private key contents into a file (or file-like) object.  If the
    password is not C{None}, the key is encrypted before writing.

    @param file_obj: the file object to write into
    @type file_obj: file
    @param password: an optional password to use to encrypt the key
    @type password: str

    @raise IOError: if there was an error writing to the file
    @raise SSHException: if the key is invalid
  */
  write_private_key : function(file_obj, password) {
    throw 'Not implemented in PKey';
  },

  /*
    Read an SSH2-format private key file, looking for a string of the type
    C{"BEGIN xxx PRIVATE KEY"} for some C{xxx}, base64-decode the text we
    find, and return it as a string.  If the private key is encrypted and
    C{password} is not C{None}, the given password will be used to decrypt
    the key (otherwise L{PasswordRequiredException} is thrown).

    @param tag: C{"RSA"} or C{"DSA"}, the tag used to mark the data block.
    @type tag: str
    @param filename: name of the file to read.
    @type filename: str
    @param password: an optional password to use to decrypt the key file,
        if it's encrypted.
    @type password: str
    @return: data blob that makes up the private key.
    @rtype: str

    @raise IOError: if there was an error reading the file.
    @raise PasswordRequiredException: if the private key file is
        encrypted, and C{password} is C{None}.
    @raise SSHException: if the key file is invalid.
  */
  _read_private_key_file : function(tag, filename, password) {
    //var file = !window.Components ? filename : localFile.init(filename);
    var file = filename;
    var data = this._read_private_key(tag, file, password);
    return data;
  },

  _read_private_key : function(tag, f, password) {
    var lines;
    //if (!(window.Components && window.Components.classes)) {  // Chrome
      lines = gKeys[f];
    /*} else {
      lines = "";
      var fstream = window.Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(window.Components.interfaces.nsIFileInputStream);
      var cstream = window.Components.classes["@mozilla.org/intl/converter-input-stream;1"].createInstance(window.Components.interfaces.nsIConverterInputStream);
      fstream.init(f, -1, 0, 0);
      cstream.init(fstream, "UTF-8", 0, 0); // you can use another encoding here if you wish

      var read = 0;
      do {
        var str = {};
        read = cstream.readString(0xffffffff, str); // read as much as we can and put it in str.value
        lines += str.value;
      } while (read != 0);
      cstream.close(); // this closes fstream
    }
    */

    lines = lines.indexOf('\r\n') != -1 ? lines.split('\r\n') : lines.split('\n');

    if (lines.length && lines[0].indexOf("PuTTY-User-Key-File-") == 0) {
      throw new paramikojs.ssh_exception.IsPuttyKey("puttykey", lines);
    }

    var start = 0;
    while (start < lines.length && (lines[start].trim() != '-----BEGIN ' + tag + ' PRIVATE KEY-----')) {
      start += 1;
    }
    if (start >= lines.length) {
      throw new paramikojs.ssh_exception.SSHException('not a valid ' + tag + ' private key file');
    }
    // parse any headers first
    var headers = {};
    start += 1;
    while (start < lines.length) {
      var l = lines[start].split(': ');
      if (l.length == 1) {
        break;
      }
      headers[l[0].toLowerCase()] = l[1].trim();
      start += 1;
    }
    // find end
    var end = start;
    while ((lines[end].trim() != '-----END ' + tag + ' PRIVATE KEY-----') && end < lines.length) {
      end += 1;
    }
    // if we trudged to the end of the file, just try to cope.
    var data;
    try {
      data = base64.decodestring(lines.slice(start, end).join(''));
    } catch (ex) {
      throw new paramikojs.ssh_exception.SSHException('base64 decoding error: ' + ex.toString());
    }
    // if password was passed in, but unencrypted
    if (!('proc-type' in headers) && password) {   // mime: don't return if we are trying with a password though
      throw new paramikojs.ssh_exception.SSHException('Private key file is not encrypted but password used.');
    }
    if (!('proc-type' in headers)) {
      // unencrypted: done
      return data;
    }
    // encrypted keyfile: will need a password
    if (headers['proc-type'] != '4,ENCRYPTED') {
      throw new paramikojs.ssh_exception.SSHException('Unknown private key structure "' + headers['proc-type'] + '"');
    }
    var h = headers['dek-info'].split(',');
    var encryption_type = h[0];
    var saltstr = h[1];
    if (!(encryption_type in this._CIPHER_TABLE)) {
      throw new paramikojs.ssh_exception.SSHException('Unknown private key cipher "' + encryption_type + '"');
    }
    // if no password was passed in, raise an exception pointing out that we need one
    if (!password) {
      throw new paramikojs.ssh_exception.PasswordRequiredException('Private key file is encrypted');
    }
    var cipher = this._CIPHER_TABLE[encryption_type]['cipher'];
    var keysize = this._CIPHER_TABLE[encryption_type]['keysize'];
    var mode = this._CIPHER_TABLE[encryption_type]['mode'];
    var salt = paramikojs.util.unhexify(saltstr);
    var key = paramikojs.util.generate_key_bytes(kryptos.hash.MD5, salt, password, keysize);
    return new cipher(key, mode, salt).decrypt(data);
  },

  /**
   * Interprets PuTTY's ".ppk" file.
   *
   * <h2>Notes</h2>
   * <ol>
   * <li>
   * The file appears to be a text file but it doesn't have the fixed encoding.
   * So we just use the platform default encoding, which is what PuTTY seems to use.
   * Fortunately, the important part is all ASCII, so this shouldn't really hurt
   * the interpretation of the key.
   * </ol>
   *
   * <h2>Sample PuTTY file format</h2>
   * <pre>
  PuTTY-User-Key-File-2: ssh-rsa
  Encryption: none
  Comment: rsa-key-20080514
  Public-Lines: 4
  AAAAB3NzaC1yc2EAAAABJQAAAIEAiPVUpONjGeVrwgRPOqy3Ym6kF/f8bltnmjA2
  BMdAtaOpiD8A2ooqtLS5zWYuc0xkW0ogoKvORN+RF4JI+uNUlkxWxnzJM9JLpnvA
  HrMoVFaQ0cgDMIHtE1Ob1cGAhlNInPCRnGNJpBNcJ/OJye3yt7WqHP4SPCCLb6nL
  nmBUrLM=
  Private-Lines: 8
  AAAAgGtYgJzpktzyFjBIkSAmgeVdozVhgKmF6WsDMUID9HKwtU8cn83h6h7ug8qA
  hUWcvVxO201/vViTjWVz9ALph3uMnpJiuQaaNYIGztGJBRsBwmQW9738pUXcsUXZ
  79KJP01oHn6Wkrgk26DIOsz04QOBI6C8RumBO4+F1WdfueM9AAAAQQDmA4hcK8Bx
  nVtEpcF310mKD3nsbJqARdw5NV9kCxPnEsmy7Sy1L4Ob/nTIrynbc3MA9HQVJkUz
  7V0va5Pjm/T7AAAAQQCYbnG0UEekwk0LG1Hkxh1OrKMxCw2KWMN8ac3L0LVBg/Tk
  8EnB2oT45GGeJaw7KzdoOMFZz0iXLsVLNUjNn2mpAAAAQQCN6SEfWqiNzyc/w5n/
  lFVDHExfVUJp0wXv+kzZzylnw4fs00lC3k4PZDSsb+jYCMesnfJjhDgkUA0XPyo8
  Emdk
  Private-MAC: 50c45751d18d74c00fca395deb7b7695e3ed6f77
   * </pre>
   *
   * @author Kohsuke Kawaguchi
   */
  _read_putty_private_key : function(tag, lines, passphrase) {
    var headers = {};
    var payload = {};

    var headerName = null;

    for (var x = 0; x < lines.length; ++x) {
      var line = lines[x];

      var idx = line.indexOf(": ");
      if (idx > 0) {
        headerName = line.substring(0, idx);
        headers[headerName] = line.substring(idx + 2);
      } else {
        var s = payload[headerName];
        if (!s) {
          s = line;
        } else {
          s += line;
        }

        payload[headerName] = s;
      }
    }

    tag = tag == "DSA" ? "DSS" : tag;
    if (headers["PuTTY-User-Key-File-2"].substring(4).toUpperCase() != tag) {
      throw new paramikojs.ssh_exception.SSHException('not a valid ' + tag + ' private key file');
    }

    var encrypted = headers["Encryption"] == "aes256-cbc";
    var publicKey = base64.decodestring(payload["Public-Lines"]);
    var privateLines = base64.decodestring(payload["Private-Lines"]);


    /**
     * Converts a passphrase into a key, by following the convention that PuTTY uses.
     *
     * <p>
     * This is used to decrypt the private key when it's encrypted.
     */
    var toKey = function(passphrase) {
      var digest = new kryptos.hash.SHA();

      digest.update("\0\0\0\0");
      digest.update(passphrase);
      var key1 = digest.digest();

      digest = new kryptos.hash.SHA();
      digest.update("\0\0\0\1");
      digest.update(passphrase);
      var key2 = digest.digest();

      return (key1 + key2).substring(0, 32);
    };

    if (encrypted) {
      var key = toKey(passphrase);

      var aes = new kryptos.cipher.AES(key, kryptos.cipher.AES.MODE_CBC, new Array(16 + 1).join('\0'));

      privateLines = aes.decrypt(privateLines);
    }

    // check MAC
    if (headers["Private-MAC"]) {
      var key = new kryptos.hash.SHA("putty-private-key-file-mac-key");
      if (encrypted) {
        key.update(passphrase);
      }
      key = key.digest();

      var message = new paramikojs.Message();
      message.add_string(headers["PuTTY-User-Key-File-2"]);
      message.add_string(headers["Encryption"]);
      message.add_string(headers["Comment"]);
      message.add_string(publicKey);
      message.add_string(privateLines);

      var realmac = binascii.hexlify(kryptos.hash.HMAC(key, message.toString(), kryptos.hash.HMAC_SHA));

      if (headers["Private-MAC"] != realmac) {
        throw new paramikojs.ssh_exception.SSHException('Unable to parse key file');
      }
    }

    var privateKey = privateLines;

    var keylist = [];
    if (headers["PuTTY-User-Key-File-2"] == "ssh-rsa") {
      var m = new paramikojs.Message(publicKey);
      m.get_string();              // skip this
      keylist.push(0);
      var e = m.get_mpint();       // e comes first in putty's format instead of n
      keylist.push(m.get_mpint()); // n
      keylist.push(e);

      m = new paramikojs.Message(privateKey);
      keylist.push(m.get_mpint()); // d
      keylist.push(m.get_mpint()); // p
      keylist.push(m.get_mpint()); // q
    } else {
      var m = new paramikojs.Message(publicKey);
      m.get_string();              // skip this
      keylist.push(0);
      keylist.push(m.get_mpint()); // p
      keylist.push(m.get_mpint()); // q
      keylist.push(m.get_mpint()); // g
      keylist.push(m.get_mpint()); // y

      m = new paramikojs.Message(privateKey);
      keylist.push(m.get_mpint()); // x
    }

    return keylist;
  },

  /*
    Write an SSH2-format private key file in a form that can be read by
    paramiko or openssh.  If no password is given, the key is written in
    a trivially-encoded format (base64) which is completely insecure.  If
    a password is given, DES-EDE3-CBC is used.

    @param tag: C{"RSA"} or C{"DSA"}, the tag used to mark the data block.
    @type tag: str
    @param filename: name of the file to write.
    @type filename: str
    @param data: data blob that makes up the private key.
    @type data: str
    @param password: an optional password to use to encrypt the file.
    @type password: str

    @raise IOError: if there was an error writing the file.
  */
  _write_private_key_file : function(tag, filename, data, password) {
    //console.log('localFile.init('+filename+')');
    var file = localFile.init(filename);
    this._write_private_key(tag, file, data, password);
  },

  _write_private_key : function(tag, f, data, password) {
    if(!(window.Components && window.Components.classes)) {
      throw new Error("Unable to write files without Mozilla's Components.classes"); //FIXME
    }

    var foStream = window.Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(window.Components.interfaces.nsIFileOutputStream);
    foStream.init(f, 0x02 | 0x08 | 0x20, 0600, 0);
    var converter = window.Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(window.Components.interfaces.nsIConverterOutputStream);
    converter.init(foStream, "UTF-8", 0, 0);

    converter.writeString('-----BEGIN ' + tag + ' PRIVATE KEY-----\n');
    if (password) {
      // since we only support one cipher here, use it
      var cipher_name = this._CIPHER_TABLE.keys()[0];
      var cipher = this._CIPHER_TABLE[cipher_name]['cipher'];
      var keysize = this._CIPHER_TABLE[cipher_name]['keysize'];
      var blocksize = this._CIPHER_TABLE[cipher_name]['blocksize'];
      var mode = this._CIPHER_TABLE[cipher_name]['mode'];
      var salt = paramikojs.rng.read(8);
      var key = paramikojs.util.generate_key_bytes(kryptos.hash.MD5, salt, password, keysize);
      if (data.length % blocksize != 0) {
        var n = blocksize - data.length % blocksize;
        //data += rng.read(n)
        //that would make more sense ^, but it confuses openssh.
        data += new Array(n + 1).join('\0');
      }
      data = new cipher(key, mode, salt).encrypt(data);
      converter.writeString('Proc-Type: 4,ENCRYPTED\n');
      converter.writeString('DEK-Info: ' + cipher_name + ',' + paramikojs.util.hexify(salt).toUpperCase() + '\n');
      converter.writeString('\n');
    }
    var s = base64.encodestring(data);
    // re-wrap to 64-char lines
    s = s.split('\n').join('');
    var t = "";
    for (var i = 0; i < s.length; i += 64) {
      t += s.substring(i, i+64) + '\n';
    }
    converter.writeString(t);
    converter.writeString('\n');
    converter.writeString('-----END ' + tag + ' PRIVATE KEY-----\n');

    converter.close(); // this closes foStream
  }
};

// Source: rsakey.js
/*
  Representation of an RSA key which can be used to sign and verify SSH2
  data.
*/
paramikojs.RSAKey = function(msg, data, filename, password, vals, file_obj) {
  inherit(this, new paramikojs.PKey());

  this.n = null;
  this.e = null;
  this.d = null;
  this.p = null;
  this.q = null;
  if (file_obj) {
    this._from_private_key(file_obj, password);
    return;
  }
  if (filename) {
    this._from_private_key_file(filename, password);
    return;
  }
  if (!msg && data) {
    msg = new paramikojs.Message(data);
  }
  if (vals) {
    this.e = vals[0];
    this.n = vals[1];
  } else {
    if (!msg) {
      throw new paramikojs.ssh_exception.SSHException('Key object may not be empty');
    }
    if (msg.get_string() != 'ssh-rsa') {
      throw new paramikojs.ssh_exception.SSHException('Invalid key');
    }
    this.e = msg.get_mpint();
    this.n = msg.get_mpint();
  }
  this.size = paramikojs.util.bit_length(this.n);
}

paramikojs.RSAKey.prototype = {
  toString : function () {
    var m = new paramikojs.Message();
    m.add_string('ssh-rsa');
    m.add_mpint(this.e);
    m.add_mpint(this.n);
    return m.toString();
  },

  compare : function(other) {
    if (this.get_name() != other.get_name()) {
      return false;
    }
    if (!this.e.equals(other.e)) {
      return false;
    }
    if (!this.n.equals(other.n)) {
      return false;
    }
    return true;
  },

  get_name : function() {
    return 'ssh-rsa';
  },

  get_bits : function() {
    return this.size;
  },

  can_sign : function() {
    return this.d != null;
  },

  sign_ssh_data : function(rpool, data, callback) {
    var digest = new kryptos.hash.SHA(data).digest();
    var pkcs1imified = this._pkcs1imify(digest);

    // XXX well, ain't this some shit.  We have to use gRsaKeyWorkerJs b/c
    // the relative url won't work if we have ssh:// or sftp:// as the url instead of chrome://
    // AAARRRGH
    // var worker = new Worker('./js/connection/paramikojs/sign_ssh_data_worker.js');
    var worker = new Worker(gRsaKeyWorkerJs);
    worker.onmessage = function(event) {
      var m = new paramikojs.Message();
      m.add_string('ssh-rsa');
      m.add_string(paramikojs.util.deflate_long(new BigInteger(event.data, 10), 0));
      callback(m);
    };
    worker.postMessage({ n: this.n.toString(), e: this.e.toString(), d: this.d.toString(), pkcs1imified: pkcs1imified });
  },

  verify_ssh_sig : function(data, msg) {
    if (msg.get_string() != 'ssh-rsa') {
      return false;
    }
    var sig = paramikojs.util.inflate_long(msg.get_string(), true);
    // verify the signature by SHA'ing the data and encrypting it using the
    // public key.  some wackiness ensues where we "pkcs1imify" the 20-byte
    // hash into a string as long as the RSA key.
    var hash_obj = paramikojs.util.inflate_long(this._pkcs1imify(new kryptos.hash.SHA(data).digest()), true);
    var rsa = new kryptos.publicKey.RSA().construct(this.n, this.e);
    return rsa.verify(hash_obj, [sig]);
  },

  _encode_key : function() {
    if (!this.p || !this.q) {
      throw new paramikojs.ssh_exception.SSHException('Not enough key info to write private key file');
    }
    keylist = [ 0, this.n, this.e, this.d, this.p, this.q,
                this.d % (this.p - 1), this.d % (this.q - 1),
                paramikojs.util.mod_inverse(this.q, this.p) ];
    var b;
    try {
      b = new paramikojs.BER();
      b.encode(keylist);
    } catch(ex) {
      throw new paramikojs.ssh_exception.SSHException('Unable to create ber encoding of key');
    }
    return b.toString();
  },

  write_private_key_file : function(filename, password) {
    this._write_private_key_file('RSA', filename, this._encode_key(), password);
  },

  write_private_key : function(file_obj, password) {
    this._write_private_key('RSA', file_obj, this._encode_key(), password);
  },

  /*
    Generate a new private RSA key.  This factory function can be used to
    generate a new host key or authentication key.

    @param bits: number of bits the generated key should be.
    @type bits: int
    @param progress_func: an optional function to call at key points in
        key generation (used by C{pyCrypto.PublicKey}).
    @type progress_func: function
    @return: new private key
    @rtype: L{RSAKey}
  */
  generate : function(bits, progress_func) {
    var rsa = new kryptos.publicKey.RSA().generate(bits, paramikojs.rng.read, progress_func);
    var key = new paramikojs.RSAKey(null, null, null, null, [rsa.e, rsa.n], null);
    key.d = rsa.d;
    key.p = rsa.p;
    key.q = rsa.q;
    return key;
  },


  // internals...


  /*
    turn a 20-byte SHA1 hash into a blob of data as large as the key's N,
    using PKCS1's \"emsa-pkcs1-v1_5\" encoding.  totally bizarre.
  */
  _pkcs1imify : function(data) {
    var SHA1_DIGESTINFO = '\x30\x21\x30\x09\x06\x05\x2b\x0e\x03\x02\x1a\x05\x00\x04\x14';
    var size = paramikojs.util.deflate_long(this.n, 0).length;
    var filler = new Array(size - SHA1_DIGESTINFO.length - data.length - 3 + 1).join('\xff');
    return '\x00\x01' + filler + '\x00' + SHA1_DIGESTINFO + data;
  },

  _from_private_key_file : function(filename, password) {
    var data;
    var keylist = null;
    try {
      data = this._read_private_key_file('RSA', filename, password);
    } catch (ex) {
      if (ex instanceof paramikojs.ssh_exception.IsPuttyKey) {
        data = null;
        keylist = this._read_putty_private_key('RSA', ex.lines, password);
      } else {
        throw ex;
      }
    }
    this._decode_key(data, keylist);
  },

  _from_private_key : function(file_obj, password) {
    var data = this._read_private_key('RSA', file_obj, password);
    this._decode_key(data);
  },

  _decode_key : function(data, keylist) {
    // private key file contains:
    // RSAPrivateKey = { version = 0, n, e, d, p, q, d mod p-1, d mod q-1, q**-1 mod p }
    try {
      keylist = keylist || new paramikojs.BER(data).decode();
    } catch(ex) {
      throw new paramikojs.ssh_exception.SSHException('Unable to parse key file');
    }
    if (!(keylist instanceof Array) || keylist.length < 4 || keylist[0] != 0) {
      throw new paramikojs.ssh_exception.SSHException('Not a valid RSA private key file (bad ber encoding)');
    }
    this.n = keylist[1];
    this.e = keylist[2];
    this.d = keylist[3];
    // not really needed
    this.p = keylist[4];
    this.q = keylist[5];
    this.size = paramikojs.util.bit_length(this.n);
  }
};

// Source: sftp_attr.js
paramikojs.SFTPAttributes = function () {
  /*
    Create a new (empty) SFTPAttributes object.  All fields will be empty.
  */
  this._flags = 0;
  this.st_size = null;
  this.st_uid = null;
  this.st_gid = null;
  this.st_mode = null;
  this.st_atime = null;
  this.st_mtime = null;
  this.attr = {};
};

paramikojs.SFTPAttributes.prototype = {
  /*
    Representation of the attributes of a file (or proxied file) for SFTP in
    client or server mode.  It attemps to mirror the object returned by
    C{os.stat} as closely as possible, so it may have the following fields,
    with the same meanings as those returned by an C{os.stat} object:
        - st_size
        - st_uid
        - st_gid
        - st_mode
        - st_atime
        - st_mtime

    Because SFTP allows flags to have other arbitrary named attributes, these
    are stored in a dict named C{attr}.  Occasionally, the filename is also
    stored, in C{filename}.
  */

  FLAG_SIZE : 1,
  FLAG_UIDGID : 2,
  FLAG_PERMISSIONS : 4,
  FLAG_AMTIME : 8,
  FLAG_EXTENDED : 0x80000000,

  /*
    Create an SFTPAttributes object from an existing C{stat} object (an
    object returned by C{os.stat}).

    @param obj: an object returned by C{os.stat} (or equivalent).
    @type obj: object
    @param filename: the filename associated with this file.
    @type filename: str
    @return: new L{SFTPAttributes} object with the same attribute fields.
    @rtype: L{SFTPAttributes}
  */
  from_stat : function(obj, filename) {
    var attr = this;
    attr.st_size = obj.st_size;
    attr.st_uid = obj.st_uid;
    attr.st_gid = obj.st_gid;
    attr.st_mode = obj.st_mode;
    attr.st_atime = obj.st_atime;
    attr.st_mtime = obj.st_mtime;
    if (filename) {
      attr.filename = filename;
    }
    return attr;
  },


  //  internals...


  _from_msg : function(msg, filename, longname) {
    var attr = this;
    attr._unpack(msg);
    if (filename) {
      attr.filename = filename;
    }
    if (longname) {
      attr.longname = longname;
    }
    return attr;
  },

  _unpack : function(msg) {
    this._flags = msg.get_int();
    if (this._flags & this.FLAG_SIZE) {
      this.st_size = msg.get_int64();
    }
    if (this._flags & this.FLAG_UIDGID) {
      this.st_uid = msg.get_int();
      this.st_gid = msg.get_int();
    }
    if (this._flags & this.FLAG_PERMISSIONS) {
      this.st_mode = msg.get_int();
    }
    if (this._flags & this.FLAG_AMTIME) {
      this.st_atime = msg.get_int();
      this.st_mtime = msg.get_int();
    }
    if (this._flags & this.FLAG_EXTENDED) {
      var count = msg.get_int();
      for (var x = 0; x < count.length; ++x) {
        this.attr[msg.get_string()] = msg.get_string();
      }
    }
  },

  _pack : function(msg) {
    this._flags = 0;
    if (this.st_size) {
      this._flags |= this.FLAG_SIZE;
    }
    if (this.st_uid && this.st_gid) {
      this._flags |= this.FLAG_UIDGID;
    }
    if (this.st_mode) {
      this._flags |= this.FLAG_PERMISSIONS;
    }
    if (this.st_atime && this.st_mtime) {
      this._flags |= this.FLAG_AMTIME;
    }
    var i;
    for (i in this.attr) {  // lamesauce :-/
      break;
    }
    if (i) {
      this._flags |= this.FLAG_EXTENDED;
    }
    msg.add_int(this._flags);
    if (this._flags & this.FLAG_SIZE) {
      msg.add_int64(this.st_size);
    }
    if (this._flags & this.FLAG_UIDGID) {
      msg.add_int(this.st_uid);
      msg.add_int(this.st_gid);
    }
    if (this._flags & this.FLAG_PERMISSIONS) {
      msg.add_int(this.st_mode);
    }
    if (this._flags & this.FLAG_AMTIME) {
      // throw away any fractional seconds
      msg.add_int(this.st_atime);
      msg.add_int(this.st_mtime);
    }
    if (this._flags & this.FLAG_EXTENDED) {
      msg.add_int(this.attr.length);
      for (var key in this.attr) {
        msg.add_string(key);
        msg.add_string(this.attr[key]);
      }
    }
  },

  _rwx : function(n, suid, sticky) {
    if (suid) {
      suid = 2;
    }
    var out = '-r'.charCodeAt(n >> 2) + '-w'.charCodeAt((n >> 1) & 1);
    if (sticky) {
      out += '-xTt'.charCodeAt(suid + (n & 1));
    } else {
      out += '-xSs'.charCodeAt(suid + (n & 1));
    }
    return out;
  },

  toString : function() {
    // todo, implement if necessary
  }
};

// Source: sftp_client.js
/*
  SFTP client object.  C{SFTPClient} is used to open an sftp session across
  an open ssh L{Transport} and do remote file operations.
*/

paramikojs.SFTPClient = function(sock, transport, callback) {
  /*
    Create an SFTP client from an existing L{Channel}.  The channel
    should already have requested the C{"sftp"} subsystem.

    An alternate way to create an SFTP client context is by using
    L{from_transport}.

    @param sock: an open L{Channel} using the C{"sftp"} subsystem
    @type sock: L{Channel}

    @raise SSHException: if there's an exception while negotiating
        sftp
  */

	inherit(this, new paramikojs.BaseSFTP());

  this.sock = sock;
  this.transport = transport;
  this.ultra_debug = false;
  this.request_number = 1;
  // lock for request_number
  this._cwd = null;
  // request # -> SFTPFile
  this._expecting = {};
  this._deferred_packet = null;

  var self = this;
  var send_version_callback = function(server_version) {
    if(ssh_console.info) console.info('Opened sftp connection (server version ' + server_version + ')');
    callback(self);
  };
  this._send_version(send_version_callback);
};

/*
  Create an SFTP client channel from an open L{Transport}.

  @param t: an open L{Transport} which is already authenticated
  @type t: L{Transport}
  @return: a new L{SFTPClient} object, referring to an sftp session
      (channel) across the transport
  @rtype: L{SFTPClient}
*/
paramikojs.SFTPClient.from_transport = function(t, callback) {
  var on_success = function(chan) {
    chan.invoke_subsystem('sftp');
    var client = new paramikojs.SFTPClient(chan, t, callback);
  }
  t.open_session(on_success);
};

paramikojs.SFTPClient.prototype = {

  /*
    Close the SFTP session and its underlying channel.

    @since: 1.4
  */
  close : function() {
    if(ssh_console.info) console.info('sftp session closed.');
    this.sock.close();
  },

  /*
    Return the underlying L{Channel} object for this SFTP session.  This
    might be useful for doing things like setting a timeout on the channel.

    @return: the SSH channel
    @rtype: L{Channel}

    @since: 1.7.1
  */
  get_channel : function() {
    return this.sock;
  },

  /*
    Return a list containing the names of the entries in the given C{path}.
    The list is in arbitrary order.  It does not include the special
    entries C{'.'} and C{'..'} even if they are present in the folder.
    This method is meant to mirror C{os.listdir} as closely as possible.
    For a list of full L{SFTPAttributes} objects, see L{listdir_attr}.

    @param path: path to list (defaults to C{'.'})
    @type path: str
    @return: list of filenames
    @rtype: list of str
  */
  listdir : function(path, callback) {
    path = path || '.';

    var listdir_callback = function(results) {
      callback(results);
    };

    this.listdir_attr(path, listdir_callback);
  },

  /*
    Return a list containing L{SFTPAttributes} objects corresponding to
    files in the given C{path}.  The list is in arbitrary order.  It does
    not include the special entries C{'.'} and C{'..'} even if they are
    present in the folder.

    The returned L{SFTPAttributes} objects will each have an additional
    field: C{longname}, which may contain a formatted string of the file's
    attributes, in unix format.  The content of this string will probably
    depend on the SFTP server implementation.

    @param path: path to list (defaults to C{'.'})
    @type path: str
    @return: list of attributes
    @rtype: list of L{SFTPAttributes}

    @since: 1.2
  */
  listdir_attr : function(path, listdir_callback) {
    path = path || '.';
    path = this._adjust_cwd(path);
    if(ssh_console.debug) console.debug('listdir(' + path + ')');

    var self = this;
    var opendir_callback = function(result, eofError, ioError) {
      if (ioError) {
        listdir_callback(ioError);
        return;
      }
      if (!result || result[0] != self.CMD_HANDLE) {
        listdir_callback(new paramikojs.ssh_exception.SFTPError('Expected handle'));
        return;
      }

      var handle = result[1].get_string();
      self.listdir_attr_callback(handle, listdir_callback);
    };

    this._request(this.CMD_OPENDIR, opendir_callback, path);
  },

  listdir_attr_callback : function(handle, listdir_callback, filelist) {
    filelist = filelist || [];

    var self = this;
    var read_callback = function(result, eofError, ioError) {
      if (ioError) {
        listdir_callback(ioError);
        return;
      }
      if (eofError) {
        self.listdir_attr_close_callback(handle, listdir_callback, filelist);
        return;
      }
      if (!result || result[0] != self.CMD_NAME) {
        listdir_callback(new paramikojs.ssh_exception.SFTPError('Expected name response'));
        return;
      }
      var count = result[1].get_int();
      for (var x = 0; x < count; ++x) {
        var filename = result[1].get_string();
        try {
          filename = self.transport.toUTF8.convertStringToUTF8(filename, "UTF-8", 1);
        } catch(ex) {
          if(ssh_console.debug) console.debug(ex);
        }
        var longname = result[1].get_string();
        try {
          longname = self.transport.toUTF8.convertStringToUTF8(longname, "UTF-8", 1);
        } catch(ex) {
          if(ssh_console.debug) console.debug(ex);
        }
        var attr = new paramikojs.SFTPAttributes()._from_msg(result[1], filename, longname);
        if (filename != '.' && filename != '..') {
          filelist.push(attr);
        }
      }

      self.listdir_attr_callback(handle, listdir_callback, filelist);
    };
    this._request(this.CMD_READDIR, read_callback, handle);
  },

  listdir_attr_close_callback : function(handle, listdir_callback, filelist) {
    var self = this;
    var close_callback = function(result) {
      self.listdir_check_symlinks(listdir_callback, filelist);
    };
    this._request(this.CMD_CLOSE, close_callback, handle);
  },

  listdir_check_symlinks : function(listdir_callback, filelist) {
    var files_to_check = [];
    for (var x = 0; x < filelist.length; ++x) {
      if (filelist[x].longname.charAt(0) == 'l') {
        var index = x;
        var filename = filelist[x].filename;
        files_to_check.push({ 'index': index, 'filename': filename });
      }
    }

    if (files_to_check.length) {
      for (var x = 0; x < files_to_check.length; ++x) {
        var index = files_to_check[x].index;
        var last = x == files_to_check.length - 1;
        var symlink_callback = this.listdir_check_symlinks_helper(listdir_callback, filelist, index, last);
        this.readlink(files_to_check[x].filename, symlink_callback);
      }
    } else {
      listdir_callback(filelist);
    }
  },

  listdir_check_symlinks_helper : function(listdir_callback, filelist, index, last) {
    return function(result) {
      filelist[index].longname += ' -> ' + result;

      if (last) {
        listdir_callback(filelist);
      }
    };
  },

  /*
    Open a file on the remote server.  The arguments are the same as for
    python's built-in C{file} (aka C{open}).  A file-like object is
    returned, which closely mimics the behavior of a normal python file
    object.

    The mode indicates how the file is to be opened: C{'r'} for reading,
    C{'w'} for writing (truncating an existing file), C{'a'} for appending,
    C{'r+'} for reading/writing, C{'w+'} for reading/writing (truncating an
    existing file), C{'a+'} for reading/appending.  The python C{'b'} flag
    is ignored, since SSH treats all files as binary.  The C{'U'} flag is
    supported in a compatible way.

    Since 1.5.2, an C{'x'} flag indicates that the operation should only
    succeed if the file was created and did not previously exist.  This has
    no direct mapping to python's file flags, but is commonly known as the
    C{O_EXCL} flag in posix.

    The file will be buffered in standard python style by default, but
    can be altered with the C{bufsize} parameter.  C{0} turns off
    buffering, C{1} uses line buffering, and any number greater than 1
    (C{>1}) uses that specific buffer size.

    @param filename: name of the file to open
    @type filename: str
    @param mode: mode (python-style) to open in
    @type mode: str
    @param bufsize: desired buffering (-1 = default buffer size)
    @type bufsize: int
    @return: a file object representing the open file
    @rtype: SFTPFile

    @raise IOError: if the file could not be opened.
  */
  open : function(filename, mode, bufsize, open_callback, current_size) {
    mode = mode || 'r';
    bufsize = bufsize || -1;
    current_size = current_size || 0;
    filename = this._adjust_cwd(filename);
    if(ssh_console.debug) console.debug('open(' + filename + ', ' + mode + ')');
    var imode = 0;
    if (mode.indexOf('r') != -1 || mode.indexOf('+') != -1) {
      imode |= this.SFTP_FLAG_READ;
    }
    if (mode.indexOf('w') != -1 || mode.indexOf('+') != -1 || mode.indexOf('a') != -1) {
      imode |= this.SFTP_FLAG_WRITE;
    }
    if (mode.indexOf('w') != -1) {
      imode |= this.SFTP_FLAG_CREATE | this.SFTP_FLAG_TRUNC;
    }
    if (mode.indexOf('a') != -1) {
      imode |= this.SFTP_FLAG_CREATE | this.SFTP_FLAG_APPEND;
    }
    if (mode.indexOf('x') != -1) {
      imode |= this.SFTP_FLAG_CREATE | this.SFTP_FLAG_EXCL;
    }
    var attrblock = new paramikojs.SFTPAttributes();

    var self = this;
    var cmd_callback = function(result) {
      if (!result || result[0] != self.CMD_HANDLE) {
        open_callback(new paramikojs.ssh_exception.SFTPError('Expected handle'));
        return;
      }
      var handle = result[1].get_string();
      if(ssh_console.debug) console.debug('open(' + filename + ', ' + mode + ') -> ' + paramikojs.util.hexify(handle));
      open_callback(new paramikojs.SFTPFile(self, handle, mode, bufsize, current_size));
    };
    this._request(this.CMD_OPEN, cmd_callback, filename, imode, attrblock);
  },

  /*
    Remove the file at the given path.  This only works on files; for
    removing folders (directories), use L{rmdir}.

    @param path: path (absolute or relative) of the file to remove
    @type path: str

    @raise IOError: if the path refers to a folder (directory)
  */
  remove : function(path, callback) {
    path = this._adjust_cwd(path);
    if(ssh_console.debug) console.debug('remove(' + path + ')');

    var self = this;
    var rm_callback = function(result, eofError, ioError) {
      if (ioError) {
        callback(ioError);
      } else {
        callback(true);
      }
    };
    this._request(this.CMD_REMOVE, rm_callback, path);
  },

  /*
    Rename a file or folder from C{oldpath} to C{newpath}.

    @param oldpath: existing name of the file or folder
    @type oldpath: str
    @param newpath: new name for the file or folder
    @type newpath: str

    @raise IOError: if C{newpath} is a folder, or something else goes
        wrong
  */
  rename : function(oldpath, newpath, callback) {
    oldpath = this._adjust_cwd(oldpath);
    newpath = this._adjust_cwd(newpath);
    if(ssh_console.debug) console.debug('rename(' + oldpath + ', ' + newpath + ')');

    var self = this;
    var mv_callback = function(result) {
      callback(result);
    };
    this._request(this.CMD_RENAME, mv_callback, oldpath, newpath);
  },

  /*
    Create a folder (directory) named C{path} with numeric mode C{mode}.
    The default mode is 0777 (octal).  On some systems, mode is ignored.
    Where it is used, the current umask value is first masked out.

    @param path: name of the folder to create
    @type path: str
    @param mode: permissions (posix-style) for the newly-created folder
    @type mode: int
  */
  mkdir : function(path, mode, callback) {
    mode = mode || 0777;
    path = this._adjust_cwd(path);
    if(ssh_console.debug) console.debug('mkdir(' + path + ', ' + mode + ')');

    var attr = new paramikojs.SFTPAttributes();
    attr.st_mode = mode;

    var self = this;
    var mkdir_callback = function(result, eofError, ioError) {
      if (ioError) {
        callback(ioError);
      } else {
        callback(true);
      }
    };

    this._request(this.CMD_MKDIR, mkdir_callback, path, attr);
  },

  /*
    Remove the folder named C{path}.

    @param path: name of the folder to remove
    @type path: str
  */
  rmdir : function(path, callback) {
    path = this._adjust_cwd(path);
    if(ssh_console.debug) console.debug('rmdir(' + path +')');

    var self = this;
    var rmdir_callback = function(result, eofError, ioError) {
      if (ioError) {
        callback(ioError);
      } else {
        callback(true);
      }
    };
    this._request(this.CMD_RMDIR, rmdir_callback, path);
  },

  /*
    Retrieve information about a file on the remote system.  The return
    value is an object whose attributes correspond to the attributes of
    python's C{stat} structure as returned by C{os.stat}, except that it
    contains fewer fields.  An SFTP server may return as much or as little
    info as it wants, so the results may vary from server to server.

    Unlike a python C{stat} object, the result may not be accessed as a
    tuple.  This is mostly due to the author's slack factor.

    The fields supported are: C{st_mode}, C{st_size}, C{st_uid}, C{st_gid},
    C{st_atime}, and C{st_mtime}.

    @param path: the filename to stat
    @type path: str
    @return: an object containing attributes about the given file
    @rtype: SFTPAttributes
  */
  stat : function(path, callback) {
    path = this._adjust_cwd(path);
    if(ssh_console.debug) console.debug('stat(' + path + ')');

    var self = this;
    var stat_callback = function(result, eofError, ioError) {
      if (ioError) {
        callback(ioError);
      } else if (result[0] != self.CMD_ATTRS) {
        callback(false);
      } else {
        callback(new paramikojs.SFTPAttributes()._from_msg(result[1]));
      }
    };
    this._request(this.CMD_STAT, stat_callback, path);
  },

  /*
    Retrieve information about a file on the remote system, without
    following symbolic links (shortcuts).  This otherwise behaves exactly
    the same as L{stat}.

    @param path: the filename to stat
    @type path: str
    @return: an object containing attributes about the given file
    @rtype: SFTPAttributes
  */
  lstat : function(path, callback) {
    path = this._adjust_cwd(path);
    if(ssh_console.debug) console.debug('lstat(' + path + ')');

    var self = this;
    var lstat_callback = function(result, eofError, ioError) {
      if (ioError) {
        callback(ioError);
      } else if (result[0] != self.CMD_ATTRS) {
        callback(false);
      } else {
        callback(new paramikojs.SFTPAttributes()._from_msg(result[1]));
      }
    };
    this._request(this.CMD_LSTAT, lstat_callback, path);
  },

  /*
    Create a symbolic link (shortcut) of the C{source} path at
    C{destination}.

    @param source: path of the original file
    @type source: str
    @param dest: path of the newly created symlink
    @type dest: str
  */
  symlink : function(source, dest, callback) {
    dest = this._adjust_cwd(dest);
    if(ssh_console.debug) console.debug('symlink(' + source + ', ' + dest + ')');
    source = this.transport.fromUTF8.ConvertFromUnicode(source) + this.transport.fromUTF8.Finish();

    var self = this;
    var symlink_callback = function(result, eofError, ioError) {
      if (ioError) {
        callback(ioError);
      } else {
        callback(true);
      }
    };

    this._request(this.CMD_SYMLINK, symlink_callback, source, dest);
  },

  /*
    Change the mode (permissions) of a file.  The permissions are
    unix-style and identical to those used by python's C{os.chmod}
    function.

    @param path: path of the file to change the permissions of
    @type path: str
    @param mode: new permissions
    @type mode: int
  */
  chmod : function(path, mode, callback) {
    path = this._adjust_cwd(path);
    if(ssh_console.debug) console.debug('chmod(' + path +', ' + mode + ')');
    var attr = new paramikojs.SFTPAttributes();
    attr.st_mode = mode;

    var self = this;
    var chmod_callback = function(result, eofError, ioError) {
      if (ioError) {
        callback(ioError);
      } else {
        callback(true);
      }
    };
    this._request(this.CMD_SETSTAT, chmod_callback, path, attr);
  },

  /*
    Change the owner (C{uid}) and group (C{gid}) of a file.  As with
    python's C{os.chown} function, you must pass both arguments, so if you
    only want to change one, use L{stat} first to retrieve the current
    owner and group.

    @param path: path of the file to change the owner and group of
    @type path: str
    @param uid: new owner's uid
    @type uid: int
    @param gid: new group id
    @type gid: int
  */
  chown : function(path, uid, gid) {
    path = this._adjust_cwd(path);
    if(ssh_console.debug) console.debug('chown(' + path + ', ' + uid + ', ' + gid + ')');
    var attr = new paramikojs.SFTPAttributes();
    attr.st_uid = uid;
    attr.st_gid = gid;
    this._request(this.CMD_SETSTAT, path, attr);
  },

  /*
    Set the access and modified times of the file specified by C{path}.  If
    C{times} is C{None}, then the file's access and modified times are set
    to the current time.  Otherwise, C{times} must be a 2-tuple of numbers,
    of the form C{(atime, mtime)}, which is used to set the access and
    modified times, respectively.  This bizarre API is mimicked from python
    for the sake of consistency -- I apologize.

    @param path: path of the file to modify
    @type path: str
    @param times: C{None} or a tuple of (access time, modified time) in
        standard internet epoch time (seconds since 01 January 1970 GMT)
    @type times: tuple(int)
  */
  utime : function(path, times, callback) {
    path = this._adjust_cwd(path);
    if (!times) {
      times = [new Date(), new Date()];
    }
    if(ssh_console.debug) console.debug('utime(' + path + ', ' + times + ')');
    var attr = new paramikojs.SFTPAttributes();
    attr.st_atime = times[0];
    attr.st_mtime = times[1];

    var self = this;
    var utime_callback = function(result, eofError, ioError) {
      if (ioError) {
        callback(ioError);
      } else {
        callback(true);
      }
    };
    this._request(this.CMD_SETSTAT, utime_callback, path, attr);
  },

  /*
    Change the size of the file specified by C{path}.  This usually extends
    or shrinks the size of the file, just like the C{truncate()} method on
    python file objects.

    @param path: path of the file to modify
    @type path: str
    @param size: the new size of the file
    @type size: int or long
  */
  truncate : function(path, size) {
    path = this._adjust_cwd(path);
    if(ssh_console.debug) console.debug('truncate(' + path + ', ' + size + ')');
    var attr = new paramikojs.SFTPAttributes();
    attr.st_size = size;
    this._request(this.CMD_SETSTAT, path, attr);
  },

  /*
    Return the target of a symbolic link (shortcut).  You can use
    L{symlink} to create these.  The result may be either an absolute or
    relative pathname.

    @param path: path of the symbolic link file
    @type path: str
    @return: target path
    @rtype: str
  */
  readlink : function(path, callback) {
    path = this._adjust_cwd(path);
    if(ssh_console.debug) console.debug('readlink(' + path + ')');

    var self = this;
    var readlink_callback = function(result) {
      if (!result || result[0] != self.CMD_NAME) {
        callback(new paramikojs.ssh_exception.SFTPError('Expected name response'));
        return;
      }
      var count = result[1].get_int();
      if (count != 1) {
        callback(new paramikojs.ssh_exception.SFTPError('Readlink returned ' + count + ' results'));
        return;
      }
      var path = result[1].get_string();
      try {
        path = self.transport.toUTF8.convertStringToUTF8(path, "UTF-8", 1);
      } catch(ex) {
        if(ssh_console.debug) console.debug(ex);
      }
      callback(path);
    };

    this._request(this.CMD_READLINK, readlink_callback, path);
  },

  /*
    Return the normalized path (on the server) of a given path.  This
    can be used to quickly resolve symbolic links or determine what the
    server is considering to be the "current folder" (by passing C{'.'}
    as C{path}).

    @param path: path to be normalized
    @type path: str
    @return: normalized form of the given path
    @rtype: str

    @raise IOError: if the path can't be resolved on the server
  */
  normalize : function(path, callback) {
    path = this._adjust_cwd(path);
    if(ssh_console.debug) console.debug('normalize(' + path + ')');

    var self = this;
    var normalize_callback = function(result) {
      if (!result || result[0] != self.CMD_NAME) {
        callback(new paramikojs.ssh_exception.SFTPError('Expected name response'));
        return;
      }
      var count = result[1].get_int();
      if (count != 1) {
        callback(new paramikojs.ssh_exception.SFTPError('Realpath returned ' + count + ' results'));
        return;
      }
      var path = result[1].get_string();
      try {
        path = self.transport.toUTF8.convertStringToUTF8(path, "UTF-8", 1);
      } catch(ex) {
        if(ssh_console.debug) console.debug(ex);
      }
      callback(path);
    };

    this._request(this.CMD_REALPATH, normalize_callback, path);
  },

  /*
    Change the "current directory" of this SFTP session.  Since SFTP
    doesn't really have the concept of a current working directory, this
    is emulated by paramiko.  Once you use this method to set a working
    directory, all operations on this SFTPClient object will be relative
    to that path. You can pass in C{None} to stop using a current working
    directory.

    @param path: new current working directory
    @type path: str

    @raise IOError: if the requested path doesn't exist on the server

    @since: 1.4
  */
  chdir : function(path, callback) {
    if (!path) {
      this._cwd = null;
      return;
    }

    var self = this;
    var stat_callback = function(attr) {
      if (attr instanceof paramikojs.ssh_exception.IOError || attr instanceof paramikojs.ssh_exception.SFTPError) {
        callback(attr);
      } else if (!attr || (attr.st_mode & 0170000) != 16384) {    // stat.S_ISDIR : S_IFMT(mode) == stat.S_IFDIR
        callback(false);
      } else {
        self.chdir_callback(path, callback);
      }
    };
    this.stat(path, stat_callback);
  },

  chdir_callback : function(path, callback) {
    var self = this;
    var normalize_callback = function(path) {
      self._cwd = path;
      callback(true);
    };
    this.normalize(path, normalize_callback);
  },

  /*
    Return the "current working directory" for this SFTP session, as
    emulated by paramiko.  If no directory has been set with L{chdir},
    this method will return C{None}.

    @return: the current working directory on the server, or C{None}
    @rtype: str

    @since: 1.4
  */
  getcwd : function() {
    return this._cwd;
  },

  /*
    Copy a local file (C{localpath}) to the SFTP server as C{remotepath}.
    Any exception raised by operations will be passed through.  This
    method is primarily provided as a convenience.

    The SFTP operations use pipelining for speed.

    @param localpath: the local file to copy
    @type localpath: str
    @param remotepath: the destination path on the SFTP server
    @type remotepath: str
    @param callback: optional callback function that accepts the bytes
        transferred so far and the total bytes to be transferred
        (since 1.7.4)
    @type callback: function(int, int)
    @param confirm: whether to do a stat() on the file afterwards to
        confirm the file size (since 1.7.7)
    @type confirm: bool

    @return: an object containing attributes about the given file
        (since 1.7.4)
    @rtype: SFTPAttributes

    @since: 1.4
  */
  put : function(localpath, remotepath, remoteSize, callback, confirm, progress_callback) {
    var fl;
    var fileInstream;
    var dataInstream;

    try {
      fl = localFile.init(localpath);
      remoteSize = remoteSize == -1 ? 0 : remoteSize;
      fileInstream = window.Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance();
      fileInstream.QueryInterface(window.Components.interfaces.nsIFileInputStream);
      fileInstream.init(fl, 0x01, 0644, 0);
      fileInstream.QueryInterface(window.Components.interfaces.nsISeekableStream);
      fileInstream.seek(0, remoteSize);                                      // append or not to append

      dataInstream = window.Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(window.Components.interfaces.nsIBinaryInputStream);
      dataInstream.setInputStream(fileInstream);
    } catch (ex) {
      if(ssh_console.debug) console.debug(ex);
      if(ssh_console.error) console.error(gStrbundle.getFormattedString("failedUpload", [localpath]));

      try {
        dataInstream.close();
      } catch (ex) { }

      try {
        fileInstream.close();
      } catch (ex) { }

      callback(new paramikojs.ssh_exception.IOError("Couldn't open local file while uploading."));
      return;
    }

    var self = this;
    var open_callback = function(fr) {
      if (!fr || fr instanceof paramikojs.ssh_exception.IOError || fr instanceof paramikojs.ssh_exception.SFTPError) {
        try {
          dataInstream.close();
        } catch (ex) { }
        callback(fr);
        return;
      }

      //fr.set_pipelined(true); todo fixme
      fr.seek(remoteSize);

      self.put_loop(dataInstream, fr, callback, progress_callback);
    };

    this.open(remotepath, (remoteSize ? 'a' : 'w') + 'b', null, open_callback, remoteSize);
  },

  put_loop : function(dataInstream, fr, callback, progress_callback) {
    try {
      var data = dataInstream.readBytes(dataInstream.available() < 32768 ? dataInstream.available() : 32768);
      if (!data.length) {
        var close_callback = function() {
          try {
            dataInstream.close();
          } catch (ex) { }
          callback(true);
        };
        fr.close(close_callback);
        return;
      }

      var self = this;
      var write_callback = function() {
        progress_callback(data.length);
        self.put_loop(dataInstream, fr, callback, progress_callback);
      };
      fr.write(data, write_callback);
    } catch (ex) {
      callback(new paramikojs.ssh_exception.IOError("Error reading file while uploading."));
    }
  },

  /*
    Copy a remote file (C{remotepath}) from the SFTP server to the local
    host as C{localpath}.  Any exception raised by operations will be
    passed through.  This method is primarily provided as a convenience.

    @param remotepath: the remote file to copy
    @type remotepath: str
    @param localpath: the destination path on the local host
    @type localpath: str
    @param callback: optional callback function that accepts the bytes
        transferred so far and the total bytes to be transferred
        (since 1.7.4)
    @type callback: function(int, int)

    @since: 1.4
  */
  get : function(remotepath, localpath, localSize, callback, progress_callback) {
    var fl;
    var fileOutstream;
    var binaryOutstream;

    try {
      fl = localFile.init(localpath);
      localSize = localSize == -1 ? 0 : localSize;
      fileOutstream = window.Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(window.Components.interfaces.nsIFileOutputStream);

      if (localSize) {
        fileOutstream.init(fl, 0x04 | 0x10, 0644, 0);
      } else {
        fileOutstream.init(fl, 0x04 | 0x08 | 0x20, 0644, 0);
      }

      binaryOutstream = window.Components.classes["@mozilla.org/binaryoutputstream;1"].createInstance(window.Components.interfaces.nsIBinaryOutputStream);
      binaryOutstream.setOutputStream(fileOutstream);
    } catch (ex) {
      if(ssh_console.debug) console.debug(ex);
      if(ssh_console.error) console.error(gStrbundle.getFormattedString("failedSave", [remotepath]));

      try {
        binaryOutstream.close();
      } catch (ex) { }

      try {
        fileOutstream.close();
      } catch (ex) { }

      callback(new paramikojs.ssh_exception.IOError("Couldn't open local file while downloading."));
      return;
    }

    var self = this;
    var open_callback = function(fr) {
      if (!fr || fr instanceof paramikojs.ssh_exception.IOError || fr instanceof paramikojs.ssh_exception.SFTPError) {
        try {
          binaryOutstream.close();
        } catch (ex) { }
        callback(fr);
        return;
      }

      var prefetch_callback = function() {
        self.get_loop(binaryOutstream, fr, callback, progress_callback);
      };

      fr.seek(localSize);
      fr.prefetch(prefetch_callback);
    };

    this.open(remotepath, 'rb', null, open_callback);
  },

  get_loop : function(binaryOutstream, fr, callback, progress_callback) {
    var self = this;
    var read_callback = function(data, eof) {
      try {
        if (!data.length) {
          fr.close(false);
          try {
            binaryOutstream.close();
          } catch (ex) { }
          callback(true);
          return;
        }
        progress_callback(data.length);
        binaryOutstream.writeBytes(data, data.length);
        self.get_loop(binaryOutstream, fr, callback, progress_callback);
      } catch (ex) {
        callback(new paramikojs.ssh_exception.IOError("Error writing file while downloading."));
      }
    };
    fr.read(32768, read_callback);
  },


  //  internals...


  _request : function(t, callback) {
    var self = this;
    var request_callback = function(num) {
      self._read_response(num, callback);
    };

    var arg = [];
    for (var x = 2; x < arguments.length; ++x) {
      arg.push(arguments[x]);
    }

    this._async_request(null, t, request_callback, arg);
  },

  _async_request : function(fileobj, t, request_callback, arg, msg, num) {
    // this method may be called from other threads (prefetch)
    num = num || this.request_number;
    if (!msg) {
      msg = new paramikojs.Message();
      msg.add_int(this.request_number);
      for (var x = 0; x < arg.length; ++x) {
        var item = arg[x];
        if (typeof item == "number") {
          msg.add_int(item);
        } else if (item instanceof BigInteger) {
          msg.add_int64(item);
        } else if (typeof item == "string") {
          msg.add_string(item);
        } else if (item instanceof paramikojs.SFTPAttributes) {
          item._pack(msg);
        } else {
          throw new paramikojs.ssh_exception.SFTPError('unknown type for ' + item + ' type ' + typeof item);
        }
      }

      this._expecting[num] = fileobj;
      this.request_number += 1;
    }

    var send_packet_callback = function() {
      if (request_callback) {
        request_callback(num);
      }
    };
    this._send_packet(t, msg.toString(), send_packet_callback);

    return num;
  },

  _read_response : function(waitfor, callback) {
    var self = this;
    var wait_callback = function() { self._read_response(waitfor, callback) };

    var result;
    if (this._deferred_packet) {  // due to setTimeout, we can get things out of order :-/
      var deferred_msg = new paramikojs.Message(this._deferred_packet[1]);
      var deferred_num = deferred_msg.get_int();
      if (deferred_num == waitfor) {
        result = this._deferred_packet;
        this._deferred_packet = null;
      } else {
        // wait for the proper packet to arrive
        setTimeout(wait_callback, 10);
        return;
      }
    }

    if (!result) {
      try {
        result = this._read_packet();
      } catch(ex) {
        if (ex instanceof paramikojs.ssh_exception.WaitException) {
          // waiting on socket
          setTimeout(wait_callback, 10);
          return;
        } else {
          throw ex;
        }
      }
    }

    var msg = new paramikojs.Message(result[1]);
    var num = msg.get_int();

    if (waitfor != null && waitfor != num) {  // due to setTimeout, we can get things out of order :-/
      this._deferred_packet = result;
      // wait for the proper packet to arrive
      setTimeout(wait_callback, 10);
      return;
    }

    if (!(num in this._expecting)) {
      // might be response for a file that was closed before responses came back
      if(ssh_console.debug) console.debug('Unexpected response #' + num);
      if (!waitfor) {
        // just doing a single check
        if (callback) {
          callback([null, null]);
        }
        return;
      }
      setTimeout(wait_callback, 10);
      return;
    }
    var fileobj = this._expecting[num];
    delete this._expecting[num];
    if (num == waitfor) {
      // synchronous
      if (result[0] == this.CMD_STATUS) {
        try {
          this._convert_status(msg);
        } catch(ex) {
          if (ex instanceof paramikojs.ssh_exception.EOFError) {
            if (callback) {
              callback(null, true);
            }
            return;
          } else if (ex instanceof paramikojs.ssh_exception.IOError) {
            if (callback) {
              callback(null, false, ex);
            }
            return;
          } else {
            throw ex;
          }
        }
      }
      if (callback) {
        callback([result[0], msg]);
      }
      return;
    }
    if (fileobj) {
      fileobj._async_response(result[0], msg);
    }
    if (!waitfor) {
      // just doing a single check
      if (callback) {
        callback([null, null]);
      }
      return;
    }

    setTimeout(wait_callback, 10);
  },

  _finish_responses : function(fileobj) {
    var x;
    while (x in this._expecting) {
      if (this._expecting[x] == fileobj) {
        this._read_response();
        fileobj._check_exception();
      }
    }
  },

  /*
    Raises EOFError or IOError on error status; otherwise does nothing.
  */
  _convert_status : function(msg) {
    var code = msg.get_int();
    var text = msg.get_string();
    if (code == this.SFTP_OK) {
      return;
    } else if (code == this.SFTP_EOF) {
      throw new paramikojs.ssh_exception.EOFError(text);
    } else if (code == this.SFTP_NO_SUCH_FILE) {
      throw new paramikojs.ssh_exception.IOError(text);
    } else if (code == this.SFTP_PERMISSION_DENIED) {
      throw new paramikojs.ssh_exception.IOError(text);
    } else {
      throw new paramikojs.ssh_exception.IOError(text);
    }
  },

  /*
    Return an adjusted path if we're emulating a "current working
    directory" for the server.
  */
  _adjust_cwd : function(path) {
    path = this.transport.fromUTF8.ConvertFromUnicode(path) + this.transport.fromUTF8.Finish();
    if (!this._cwd) {
      return path;
    }
    if (path.length > 0 && path[0] == '/') {
      // absolute path
      return path;
    }
    if (this._cwd == '/') {
      return this._cwd + path;
    }

    var cwd = this.transport.fromUTF8.ConvertFromUnicode(this._cwd) + this.transport.fromUTF8.Finish();
    return cwd + '/' + path;
  }
};

// Source: sftp_file.js
// todo fixme: when mozilla supports files over 4GB (2GB for uploads)
// the variables _realpos, offset, and length need to be converted to BigIntegers
//

/*
  Proxy object for a file on the remote server, in client mode SFTP.
*/
paramikojs.SFTPFile = function(sftp, handle, mode, bufsize, current_size) {
  inherit(this, new paramikojs.BufferedFile());

  mode = mode || 'r';
  bufsize = bufsize || -1;
  current_size = current_size || 0;

  this.sftp = sftp;
  this.handle = handle;
  // NOTE(mime): b/c we avoid doing stat() in get_size we have to set the _size manually for appending to work properly
  this._size = current_size;
  this._set_mode(mode, bufsize);
  this.mode = mode;
  this.bufsize = bufsize;
  this.pipelined = false;
  this._prefetching = false;
  this._prefetch_done = false;
  this._prefetch_data = {};
  this._prefetch_reads = [];
  this._saved_exception = null;
};

paramikojs.SFTPFile.prototype = {
  // Some sftp servers will choke if you send read/write requests larger than
  // this size.
  MAX_REQUEST_SIZE : 32768,

  close : function(callback) {
    this._close(false, callback);
  },

  _close : function(async, callback) {
    // We allow double-close without signaling an error, because real
    // Python file objects do.  However, we must protect against actually
    // sending multiple CMD_CLOSE packets, because after we close our
    // handle, the same handle may be re-allocated by the server, and we
    // may end up mysteriously closing some random other file.  (This is
    // especially important because we unconditionally call close() from
    // __del__.)
    if (this._closed) {
      return;
    }
    if(ssh_console.debug) console.debug('close(' + paramikojs.util.hexify(this.handle) + ')');
    if (this.pipelined) {
      this.sftp._finish_responses(this);
    }
    this.__close();
    try {
      if (async) {
        // GC'd file handle could be called from an arbitrary thread -- don't wait for a response
        this.sftp._async_request(null, this.sftp.CMD_CLOSE, null, [this.handle]);
      } else {
        this.sftp._request(this.sftp.CMD_CLOSE, callback, this.handle);
      }
    } catch(ex) {
      // pass
    }
  },

  _data_in_prefetch_requests : function(offset, size) {
    var k = [];
    for (var x = 0; x < this._prefetch_reads.length; ++x) {
      if (this._prefetch_reads[x][0] <= offset) {
        k.push(this._prefetch_reads[x]);
      }
    }
    if (k.length == 0) {
      return false;
    }
    function compare(x, y) {
      if (x[0] < y[0]) {
        return -1;
      }
      if (x[0] > y[0]) {
        return 1;
      }
      return 0;
    }
    k.sort(compare);
    var buf_offset = k[k.length - 1];
    var buf_size = k[k.length - 1];
    if (buf_offset + buf_size <= offset) {
      // prefetch request ends before this one begins
      return false;
    }
    if (buf_offset + buf_size >= offset + size) {
      // inclusive
      return true;
    }
    // well, we have part of the request.  see if another chunk has the rest.
    return this._data_in_prefetch_requests(buf_offset + buf_size, offset + size - buf_offset - buf_size);
  },

  /*
    if a block of data is present in the prefetch buffers, at the given
    offset, return the offset of the relevant prefetch buffer.  otherwise,
    return None.  this guarantees nothing about the number of bytes
    collected in the prefetch buffer so far.
  */
  _data_in_prefetch_buffers : function(offset) {
    var k = [];
    var index = null;
    for (var i in this._prefetch_data) {
      if (i <= offset) {
        k.push(i);
        if (!index || i > index) {
          index = i;
        }
      }
    }
    if (k.length == 0) {
      return null;
    }
    var buf_offset = offset - index;
    if (buf_offset >= this._prefetch_data[index].length) {
      // it's not here
      return null;
    }
    return index;
  },

  /*
    read data out of the prefetch buffer, if possible.  if the data isn't
    in the buffer, return None.  otherwise, behaves like a normal read.
  */
  _read_prefetch : function(size, callback) {
    // while not closed, and haven't fetched past the current position, and haven't reached EOF...

    var offset = this._data_in_prefetch_buffers(this._realpos);
    if (offset != null) {
      this._read_prefetch_finished(size, offset, callback);
      return;
    }
    if (this._prefetch_done || this._closed) {
      this._read_prefetch_finished(size, null, callback);
      return;
    }

    var self = this;
    var read_response_callback = function() {
      self._check_exception();
      self._read_prefetch(size, callback);
    };
    this.sftp._read_response(null, read_response_callback);
  },

  _read_prefetch_finished : function(size, offset, callback) {
    if (offset == null) {
      this._prefetching = false;
      callback(null);
      return;
    }
    var prefetch = this._prefetch_data[offset];
    delete this._prefetch_data[offset];

    var buf_offset = this._realpos - offset;
    if (buf_offset > 0) {
      this._prefetch_data[offset] = prefetch.substring(0, buf_offset);
      prefetch = prefetch.substring(buf_offset);
    }
    if (size < prefetch.length) {
      this._prefetch_data[this._realpos + size] = prefetch.substring(size);
      prefetch = prefetch.substring(0, size);
    }
    callback(prefetch);
  },

  _read : function(size, callback) {
    size = Math.min(size, this.MAX_REQUEST_SIZE);
    if (this._prefetching) {
      this._read_prefetch(size, callback);
      return;
    }
    var self = this;
    var read_callback = function(result, eofError, ioError) {
      if (eofError) {
        callback(null);
        return;
      }
      if (result[0] != self.sftp.CMD_DATA) {
        throw new paramikojs.ssh_exception.SFTPError('Expected data');
      }
      callback(result[1].get_string());
    };
    this.sftp._request(this.sftp.CMD_READ, read_callback, this.handle, new BigInteger(this._realpos.toString(), 10), size);
  },

  _write : function(data, callback, total_data_len) {
    // may write less than requested if it would exceed max packet size
    var chunk = Math.min(data.length, this.MAX_REQUEST_SIZE);
    var req = this.sftp._async_request(null, this.sftp.CMD_WRITE, null, [this.handle, new BigInteger(this._realpos.toString(), 10), data.substring(0, chunk)]);
    if (!this.pipelined || this.sftp.sock.recv_ready()) {
      var self = this;
      var response_callback = function(result) {
        if (result[0] != self.sftp.CMD_STATUS) {
          throw new paramikojs.ssh_exception.SFTPError('Expected status');
        }
        // convert_status already called
        if (total_data_len <= self.MAX_REQUEST_SIZE) {
          callback();
        }
      }
      this.sftp._read_response(req, response_callback);
    }
    return chunk;
  },

  /*
    Set a timeout on read/write operations on the underlying socket or
    ssh L{Channel}.

    @see: L{Channel.settimeout}
    @param timeout: seconds to wait for a pending read/write operation
        before raising C{socket.timeout}, or C{None} for no timeout
    @type timeout: float
  */
  settimeout : function(timeout) {
    this.sftp.sock.settimeout(timeout);
  },

  /*
    Returns the timeout in seconds (as a float) associated with the socket
    or ssh L{Channel} used for this file.

    @see: L{Channel.gettimeout}
    @rtype: float
  */
  gettimeout : function() {
    return this.sftp.sock.gettimeout();
  },

  /*
    Set blocking or non-blocking mode on the underiying socket or ssh
    L{Channel}.

    @see: L{Channel.setblocking}
    @param blocking: 0 to set non-blocking mode; non-0 to set blocking
        mode.
    @type blocking: int
  */
  setblocking : function(blocking) {
    this.sftp.sock.setblocking(blocking);
  },

  seek : function(offset, whence) {
    whence = whence || 0;
    this.flush();
    if (whence == this.SEEK_SET) {
      this._realpos = this._pos = offset;
    } else if (whence == this.SEEK_CUR) {
      this._pos += offset;
      this._realpos = this._pos;
    } else {
      this._realpos = this._pos = this._get_size() + offset;
    }
    this._rbuffer = '';
  },

  /*
    Retrieve information about this file from the remote system.  This is
    exactly like L{SFTP.stat}, except that it operates on an already-open
    file.

    @return: an object containing attributes about this file.
    @rtype: SFTPAttributes
  */
  stat : function(callback) {
    var self = this;
    var stat_callback = function(result, eofError, ioError) {
      if (ioError) {
        callback(ioError);
      } else if (result[0] != self.sftp.CMD_ATTRS) {
        callback(false);
      } else {
        callback(new paramikojs.SFTPAttributes()._from_msg(result[1]));
      }
    };
    this.sftp._request(this.sftp.CMD_FSTAT, stat_callback, this.handle);
  },

  /*
    Change the mode (permissions) of this file.  The permissions are
    unix-style and identical to those used by python's C{os.chmod}
    function.

    @param mode: new permissions
    @type mode: int
  */
  chmod : function(mode) {
    if(ssh_console.debug) console.debug('chmod(' + paramikojs.util.hexify(this.handle) + ', ' + mode + ')');
    var attr = new paramikojs.SFTPAttributes();
    attr.st_mode = mode;
    this.sftp._request(this.sftp.CMD_FSETSTAT, null, this.handle, attr);
  },

  /*
    Change the owner (C{uid}) and group (C{gid}) of this file.  As with
    python's C{os.chown} function, you must pass both arguments, so if you
    only want to change one, use L{stat} first to retrieve the current
    owner and group.

    @param uid: new owner's uid
    @type uid: int
    @param gid: new group id
    @type gid: int
  */
  chown : function(uid, gid) {
    if(ssh_console.debug) console.debug('chown(' + paramikojs.util.hexify(this.handle) + ', ' + uid +', ' + gid + ')');
    var attr = new paramikojs.SFTPAttributes();
    attr.st_uid = uid;
    attr.st_gid = gid;
    this.sftp._request(this.sftp.CMD_FSETSTAT, null, this.handle, attr);
  },

  /*
    Set the access and modified times of this file.  If
    C{times} is C{None}, then the file's access and modified times are set
    to the current time.  Otherwise, C{times} must be a 2-tuple of numbers,
    of the form C{(atime, mtime)}, which is used to set the access and
    modified times, respectively.  This bizarre API is mimicked from python
    for the sake of consistency -- I apologize.

    @param times: C{None} or a tuple of (access time, modified time) in
        standard internet epoch time (seconds since 01 January 1970 GMT)
    @type times: tuple(int)
  */
  utime : function(times) {
    if (!times) {
      times = [new Date(), new Date()];
    }
    if(ssh_console.debug) console.debug('utime(' + paramikojs.util.hexify(this.handle) + ', ' + times + ')');
    var attr = new paramikojs.SFTPAttributes();
    attr.st_atime = times[0];
    attr.st_mtime = times[1];
    this.sftp._request(this.sftp.CMD_FSETSTAT, null, this.handle, attr);
  },

  /*
    Change the size of this file.  This usually extends
    or shrinks the size of the file, just like the C{truncate()} method on
    python file objects.

    @param size: the new size of the file
    @type size: int or long
  */
  truncate : function(size) {
    if(ssh_console.debug) console.debug('truncate(' + paramikojs.util.hexify(this.handle) + ', ' + size + ')');
    var attr = new paramikojs.SFTPAttributes();
    attr.st_size = size;
    this.sftp._request(this.sftp.CMD_FSETSTAT, null, this.handle, attr);
  },

  /*
    Ask the server for a hash of a section of this file.  This can be used
    to verify a successful upload or download, or for various rsync-like
    operations.

    The file is hashed from C{offset}, for C{length} bytes.  If C{length}
    is 0, the remainder of the file is hashed.  Thus, if both C{offset}
    and C{length} are zero, the entire file is hashed.

    Normally, C{block_size} will be 0 (the default), and this method will
    return a byte string representing the requested hash (for example, a
    string of length 16 for MD5, or 20 for SHA-1).  If a non-zero
    C{block_size} is given, each chunk of the file (from C{offset} to
    C{offset + length}) of C{block_size} bytes is computed as a separate
    hash.  The hash results are all concatenated and returned as a single
    string.

    For example, C{check('sha1', 0, 1024, 512)} will return a string of
    length 40.  The first 20 bytes will be the SHA-1 of the first 512 bytes
    of the file, and the last 20 bytes will be the SHA-1 of the next 512
    bytes.

    @param hash_algorithm: the name of the hash algorithm to use (normally
        C{"sha1"} or C{"md5"})
    @type hash_algorithm: str
    @param offset: offset into the file to begin hashing (0 means to start
        from the beginning)
    @type offset: int or long
    @param length: number of bytes to hash (0 means continue to the end of
        the file)
    @type length: int or long
    @param block_size: number of bytes to hash per result (must not be less
        than 256; 0 means to compute only one hash of the entire segment)
    @type block_size: int
    @return: string of bytes representing the hash of each block,
        concatenated together
    @rtype: str

    @note: Many (most?) servers don't support this extension yet.

    @raise IOError: if the server doesn't support the "check-file"
        extension, or possibly doesn't support the hash algorithm
        requested

    @since: 1.4
  */
  check : function(hash_algorithm, offset, length, block_size) {
    offset = offset || 0;
    length = length || 0;
    block_size = block_size || 0;

    var result = this.sftp._request(this.sftp.CMD_EXTENDED, null, 'check-file', this.handle,
                                hash_algorithm, new BigInteger(offset.toString(), 10), new BigInteger(length.toString(), 10), block_size);
    ext = result[1].get_string();
    alg = result[1].get_string();
    data = result[1].get_remainder();
    return data;
  },

  /*
    Turn on/off the pipelining of write operations to this file.  When
    pipelining is on, paramiko won't wait for the server response after
    each write operation.  Instead, they're collected as they come in.
    At the first non-write operation (including L{close}), all remaining
    server responses are collected.  This means that if there was an error
    with one of your later writes, an exception might be thrown from
    within L{close} instead of L{write}.

    By default, files are I{not} pipelined.

    @param pipelined: C{True} if pipelining should be turned on for this
        file; C{False} otherwise
    @type pipelined: bool

    @since: 1.5
  */
  set_pipelined : function(pipelined) {
    pipelined = pipelined == undefined ? true : pipelined;
    this.pipelined = pipelined;
  },

  /*
    Pre-fetch the remaining contents of this file in anticipation of
    future L{read} calls.  If reading the entire file, pre-fetching can
    dramatically improve the download speed by avoiding roundtrip latency.
    The file's contents are incrementally buffered in a background thread.

    The prefetched data is stored in a buffer until read via the L{read}
    method.  Once data has been read, it's removed from the buffer.  The
    data may be read in a random order (using L{seek}); chunks of the
    buffer that haven't been read will continue to be buffered.

    @since: 1.5.1
  */
  prefetch : function(callback) {
    var self = this;
    var stat_callback = function(attr) {
      if (attr instanceof paramikojs.ssh_exception.IOError) {
        throw attr;
      }

      var size = self.size = attr.st_size;
      // queue up async reads for the rest of the file
      var chunks = [];
      var n = self._realpos;
      while (n < size) {
        chunk = Math.min(self.MAX_REQUEST_SIZE, size - n);
        chunks.push([n, chunk]);
        n += chunk;
      }
      if (chunks.length > 0) {
        self._start_prefetch(chunks);
      }

      callback();
    };

    this.stat(stat_callback);
  },

  /*
    Read a set of blocks from the file by (offset, length).  This is more
    efficient than doing a series of L{seek} and L{read} calls, since the
    prefetch machinery is used to retrieve all the requested blocks at
    once.

    @param chunks: a list of (offset, length) tuples indicating which
        sections of the file to read
    @type chunks: list(tuple(long, int))
    @return: a list of blocks read, in the same order as in C{chunks}
    @rtype: list(str)

    @since: 1.5.4
  */
  readv : function(chunks) {
    if(ssh_console.debug) console.debug('readv(' + paramikojs.util.hexify(this.handle) + ', ' + chunks + ')');

    var read_chunks = [];
    for (var x = 0; x < chunks.length; ++x) {
      var offset = chunks[x][0];
      var size = chunks[x][1];
      // don't fetch data that's already in the prefetch buffer
      if (this._data_in_prefetch_buffers(offset) || this._data_in_prefetch_requests(offset, size)) {
        continue;
      }

      // break up anything larger than the max read size
      while (size > 0) {
        var chunk_size = Math.min(size, this.MAX_REQUEST_SIZE);
        read_chunks.push([offset, chunk_size]);
        offset += chunk_size;
        size -= chunk_size;
      }
    }

    this._start_prefetch(read_chunks);
    // now we can just devolve to a bunch of read()s :)
    var results = [];
    for (var x; x < chunks.length; ++x) {
      this.seek(chunks[x][0]);
      results.push(this.read(chunks[x][1]));
    }
  },


  //  internals...


  _get_size : function() {
    return this._size;
    // we avoid making this call to simplify things and create less callbacks
    /*try {
      return this.stat().st_size;
    } catch(ex) {
      return 0;
    }*/
  },

  _start_prefetch : function(chunks) {
    this._prefetching = true;
    this._prefetch_done = false;
    this._prefetch_reads = this._prefetch_reads.concat(chunks);

    this._prefetch_thread(chunks);
  },

  _prefetch_thread : function(chunks) {
    // do these read requests in a temporary thread because there may be
    // a lot of them, so it may block.
    for (var x = 0; x < chunks.length; ++x) {
      var offset = chunks[x][0];
      var length = chunks[x][1];
      this.sftp._async_request(this, this.sftp.CMD_READ, null, [this.handle, new BigInteger(offset.toString(), 10), length]);
    }
  },

  _async_response : function(t, msg) {
    if (t == this.sftp.CMD_STATUS) {
      // save exception and re-raise it on next file operation
      try {
        this.sftp._convert_status(msg);
      } catch(ex) {
        this._saved_exception = ex;
      }
      return;
    }
    if (t != this.sftp.CMD_DATA) {
      throw new paramikojs.ssh_exception.SFTPError('Expected data');
    }
    var data = msg.get_string();
    var prefetch_read = this._prefetch_reads.shift();
    this._prefetch_data[prefetch_read[0]] = data;
    if (this._prefetch_reads.length == 0) {
      this._prefetch_done = true;
    }
  },

  // if there's a saved exception, raise & clear it
  _check_exception : function() {
    if (this._saved_exception) {
      var x = this._saved_exception;
      this._saved_exception = null;
      throw x;
    }
  }
};

// Source: sftp.js
paramikojs.BaseSFTP = function () {
  this.ultra_debug = false;
};

paramikojs.BaseSFTP.prototype = {
	CMD_INIT : 1,
  CMD_VERSION : 2,
  CMD_OPEN : 3,
  CMD_CLOSE : 4,
  CMD_READ : 5,
  CMD_WRITE : 6,
  CMD_LSTAT : 7,
  CMD_FSTAT : 8,
  CMD_SETSTAT : 9,
  CMD_FSETSTAT : 10,
  CMD_OPENDIR : 11,
  CMD_READDIR : 12,
  CMD_REMOVE : 13,
  CMD_MKDIR : 14,
  CMD_RMDIR : 15,
  CMD_REALPATH : 16,
  CMD_STAT : 17,
  CMD_RENAME : 18,
  CMD_READLINK : 19,
  CMD_SYMLINK : 20,

  CMD_STATUS : 101,
  CMD_HANDLE : 102,
  CMD_DATA : 103,
  CMD_NAME : 104,
  CMD_ATTRS : 105,

  CMD_EXTENDED : 200,
  CMD_EXTENDED_REPLY : 201,

  SFTP_OK : 0,
  SFTP_EOF : 1,
  SFTP_NO_SUCH_FILE : 2,
  SFTP_PERMISSION_DENIED : 3,
  SFTP_FAILURE : 4,
  SFTP_BAD_MESSAGE : 5,
  SFTP_NO_CONNECTION : 6,
  SFTP_CONNECTION_LOST : 7,
  SFTP_OP_UNSUPPORTED : 8,

  SFTP_DESC : [ 'Success',
              'End of file',
              'No such file',
              'Permission denied',
              'Failure',
              'Bad message',
              'No connection',
              'Connection lost',
              'Operation unsupported' ],

  SFTP_FLAG_READ : 0x1,
  SFTP_FLAG_WRITE : 0x2,
  SFTP_FLAG_APPEND : 0x4,
  SFTP_FLAG_CREATE : 0x8,
  SFTP_FLAG_TRUNC : 0x10,
  SFTP_FLAG_EXCL : 0x20,

  _VERSION : 3,


  // for debugging
  CMD_NAMES : {
    1: 'init',
    2: 'version',
    3: 'open',
    4: 'close',
    5: 'read',
    6: 'write',
    7: 'lstat',
    8: 'fstat',
    9: 'setstat',
    10: 'fsetstat',
    11: 'opendir',
    12: 'readdir',
    13: 'remove',
    14: 'mkdir',
    15: 'rmdir',
    16: 'realpath',
    17: 'stat',
    18: 'rename',
    19: 'readlink',
    20: 'symlink',
    101: 'status',
    102: 'handle',
    103: 'data',
    104: 'name',
    105: 'attrs',
    200: 'extended',
    201: 'extended_reply'
  },


  //  internals...

  _send_version : function(callback) {
    var self = this;
    var send_packet_callback = function() {
      self._send_version_callback(callback);
    };
    this._send_packet(this.CMD_INIT, struct.pack('>I', this._VERSION), send_packet_callback);
  },

  _send_version_callback : function(callback) {
    try {
      var packet = this._read_packet();
    } catch(ex) {
      if (ex instanceof paramikojs.ssh_exception.WaitException) {
        // waiting on socket
        var self = this;
        var wait_callback = function() { self._send_version_callback(callback) };
        setTimeout(wait_callback, 10);
        return;
      } else {
        throw ex;
      }
    }

    if (packet[0] != this.CMD_VERSION) {
      throw 'Incompatible sftp protocol';
    }
    var version = struct.unpack('>I', packet[1].substring(0, 4))[0];
    //        if version != _VERSION:
    //            raise SFTPError('Incompatible sftp protocol')
    callback(version);
  },

  _send_server_version : function() {
    // winscp will freak out if the server sends version info before the
    // client finishes sending INIT.
    var packet = this._read_packet();
    if (t != this.CMD_INIT) {
      throw 'Incompatible sftp protocol';
    }
    var version = struct.unpack('>I', packet[0].substring(0, 4))[0];
    // advertise that we support "check-file"
    var extension_pairs = [ 'check-file', 'md5,sha1' ];
    var msg = new paramikojs.Message();
    msg.add_int(this._VERSION);
    msg.add(extension_pairs);
    this._send_packet(this.CMD_VERSION, msg.toString());
    return version;
  },

  _write_all : function(out, send_packet_callback) {
    while (out.length > 0) {
      try {
        var n = this.sock.send(out);
      } catch(ex) {
        if (ex instanceof paramikojs.ssh_exception.WaitException) {
          // waiting on window adjust
          var self = this;
          var wait_callback = function() { self._write_all(out, send_packet_callback) };
          setTimeout(wait_callback, 10);
          return;
        } else {
          throw ex;
        }
      }
      if (n <= 0) {
        throw new paramikojs.ssh_exception.EOFError();
      }
      if (n == out.length) {
        if (send_packet_callback) {
          send_packet_callback();
        }
        return;
      }
      out = out.substring(n);
    }
  },

  _read_all : function(n) {
    var out = this.sock.recv(n);
    if (out.length < n) {
      // waiting on socket
      this.sock.in_buffer = out + this.sock.in_buffer;              // add data back into in_buffer
      throw new paramikojs.ssh_exception.WaitException("wait");
    }
    return out;
  },

  _send_packet : function(t, packet, send_packet_callback) {
    //self._log(DEBUG2, 'write: %s (len=%d)' % (CMD_NAMES.get(t, '0x%02x' % t), len(packet)))
    if(ssh_console.debug) console.debug('write: ' + this.CMD_NAMES[t] + '(len=' + packet.length + ')');
    var out = struct.pack('>I', packet.length + 1) + String.fromCharCode(t) + packet;
    if (this.ultra_debug) {
      if(ssh_console.debug) console.debug(paramikojs.util.format_binary(out, 'OUT: '));
    }
    this._write_all(out, send_packet_callback);
  },

  _read_packet : function() {
    var x = this._read_all(4);
    // most sftp servers won't accept packets larger than about 32k, so
    // anything with the high byte set (> 16MB) is just garbage.
    if (x[0] != '\x00') {
      throw 'Garbage packet received';
    }
    var size = struct.unpack('>I', x)[0];
    try {
      var data = this._read_all(size);
    } catch(ex) {
      if (ex instanceof paramikojs.ssh_exception.WaitException) {
        // waiting on socket
        this.sock.in_buffer = x + this.sock.in_buffer;              // add header back into in_buffer
        throw new paramikojs.ssh_exception.WaitException("wait");   // rethrow exception
      } else {
        throw ex;
      }
    }
    if (this.ultra_debug) {
      if(ssh_console.debug) console.debug(paramikojs.util.format_binary(data, 'IN: '));
    }
    if (size > 0) {
      var t = data[0].charCodeAt(0);
      if(ssh_console.debug) console.debug('read: ' + this.CMD_NAMES[t] + '(len=' + (data.length - 1) + ')');
      return [t, data.substring(1)];
    }
    return [0, ''];
  }
};

// Source: ssh_exception.js
paramikojs.ssh_exception = {}

/*
  Exception raised by failures in SSH2 protocol negotiation or logic errors.
*/
paramikojs.ssh_exception.SSHException = function(message) {
	this.message = message;
  this.custom = true;
  this.name = "SSHException";
};

paramikojs.ssh_exception.SSHException.prototype.toString = function () {
  return this.name + ': "' + this.message + '"';
};

paramikojs.ssh_exception.WaitException = function(message) {
  var baseEx = new paramikojs.ssh_exception.SSHException(message);
  inherit(this, baseEx);
  this.toString = baseEx.toString;
  this.name = "WaitException";
};

paramikojs.ssh_exception.CipherException = function(message) {
  var baseEx = new paramikojs.ssh_exception.SSHException(message);
  inherit(this, baseEx);
  this.toString = baseEx.toString;
  this.name = "CipherException";
};

paramikojs.ssh_exception.EOFError = function(message) {
  var baseEx = new paramikojs.ssh_exception.SSHException(message);
  inherit(this, baseEx);
  this.toString = baseEx.toString;
  this.name = "EOFError";
};

paramikojs.ssh_exception.IOError = function(message) {
  var baseEx = new paramikojs.ssh_exception.SSHException(message);
  inherit(this, baseEx);
  this.toString = baseEx.toString;
  this.name = "IOError";
};

paramikojs.ssh_exception.SFTPError = function(message) {
  var baseEx = new paramikojs.ssh_exception.SSHException(message);
  inherit(this, baseEx);
  this.toString = baseEx.toString;
  this.name = "SFTPError";
};

paramikojs.ssh_exception.UserRequestedDisconnect = function(message) {
  var baseEx = new paramikojs.ssh_exception.SSHException(message);
  inherit(this, baseEx);
  this.toString = baseEx.toString;
  this.name = "UserRequestedDisconnect";
};

paramikojs.ssh_exception.IsPuttyKey = function(message, lines) {
  var baseEx = new paramikojs.ssh_exception.SSHException(message);
  inherit(this, baseEx);
  this.toString = baseEx.toString;
  this.name = "IsPuttyKey";
  this.lines = lines;
};

paramikojs.ssh_exception.BERException = function(message) {
  var baseEx = new paramikojs.ssh_exception.SSHException(message);
  inherit(this, baseEx);
  this.toString = baseEx.toString;
  this.name = "BERException";
};

paramikojs.ssh_exception.NeedRekeyException = function(message) {
  var baseEx = new paramikojs.ssh_exception.SSHException(message);
  inherit(this, baseEx);
  this.toString = baseEx.toString;
  this.name = "NeedRekeyException";
};

/*
  Exception raised when authentication failed for some reason.  It may be
  possible to retry with different credentials.  (Other classes specify more
  specific reasons.)

  @since: 1.6
*/
paramikojs.ssh_exception.AuthenticationException = function(message) {
  var baseEx = new paramikojs.ssh_exception.SSHException(message);
  inherit(this, baseEx);
  this.toString = baseEx.toString;
  this.name = "AuthenticationException";
};

/*
  Exception raised when a password is needed to unlock a private key file.
*/
paramikojs.ssh_exception.PasswordRequiredException = function(message) {
  var baseEx = new paramikojs.ssh_exception.SSHException(message);
  inherit(this, baseEx);
  this.toString = baseEx.toString;
  this.name = "PasswordRequiredException";
};

/*
  Exception raised when an authentication type (like password) is used, but
  the server isn't allowing that type.  (It may only allow public-key, for
  example.)

  @ivar allowed_types: list of allowed authentication types provided by the
      server (possible values are: C{"none"}, C{"password"}, and
      C{"publickey"}).
  @type allowed_types: list

  @since: 1.1
*/
paramikojs.ssh_exception.BadAuthenticationType = function(message, types) {
  var baseEx = new paramikojs.ssh_exception.SSHException(message);
  inherit(this, baseEx);
  this.toString = baseEx.toString;
  this.name = "BadAuthenticationType";
  this.allowed_types = types;
};

paramikojs.ssh_exception.BadAuthenticationType.prototype.toString = function () {
  return this.name + ': "' + this.message + '"' + '(allowed_types=' + JSON.stringify(this.allowed_types) + ')';
};

/*
  An internal exception thrown in the case of partial authentication.
*/
paramikojs.ssh_exception.PartialAuthentication = function(types) {
  var baseEx = new paramikojs.ssh_exception.SSHException('partial authentication');
  inherit(this, baseEx);
  this.toString = baseEx.toString;
  this.name = "PartialAuthentication";
  this.allowed_types = types;
};

/*
  Exception raised when an attempt to open a new L{Channel} fails.

  @ivar code: the error code returned by the server
  @type code: int

  @since: 1.6
*/
paramikojs.ssh_exception.ChannelException = function(code, text) {
  var baseEx = new paramikojs.ssh_exception.SSHException(text);
  inherit(this, baseEx);
  this.toString = baseEx.toString;
  this.name = "ChannelException";
  this.code = code;
};

/*
  The host key given by the SSH server did not match what we were expecting.

  @ivar hostname: the hostname of the SSH server
  @type hostname: str
  @ivar key: the host key presented by the server
  @type key: L{PKey}
  @ivar expected_key: the host key expected
  @type expected_key: L{PKey}

  @since: 1.6
*/
paramikojs.ssh_exception.BadHostKeyException = function(hostname, got_key, expected_key) {
  var baseEx = new paramikojs.ssh_exception.SSHException('Host key for server ' + hostname + ' does not match!');
  inherit(this, baseEx);
  this.toString = baseEx.toString;
  this.name = "BadHostKeyException";
  this.hostname = hostname;
  this.key = got_key;
  this.expected_key = expected_key;
};

// Source: transport.js
paramikojs.transport = function() {
  this.rng = new kryptos.random.Random();
  this.packetizer = new paramikojs.Packetizer(this);
  this.packetizer.set_hexdump(false);
  this.local_version = 'SSH-' + this._PROTO_ID + '-' + this._CLIENT_ID;
  this.remote_version = '';
  this.local_cipher = this.remote_cipher = '';
  this.local_kex_init = this.remote_kex_init = null;
  this.local_mac = this.remote_mac = null;
  this.local_compression = this.remote_compression = null;
  this.session_id = null;
  this.host_key_type = null;
  this.host_key = null;

  // state used during negotiation
  this.kex_engine = null;
  this.H = null;
  this.K = null;

  this.active = false;
  this.initial_kex_done = false;
  this.in_kex = false;
  this.authenticated = false;
  this._expected_packet = [];

  // tracking open channels
  this._channels = { };
  this.channel_events = { };       // (id -> Event)
  this.channels_seen = { };        // (id -> True)
  this._channel_counter = 1;
  this.window_size = 65536;
  this.max_packet_size = 34816;
  this._x11_handler = null;
  this._tcp_handler = null;

  this.saved_exception = null;
  this.clear_to_send = false;
  this.auth_handler = null;
  this.global_response = null;     // response Message from an arbitrary global request
  this.completion_event = null;    // user-defined event callbacks
  this.banner_timeout = 15;        // how long (seconds) to wait for the SSH banner
};

paramikojs.transport.prototype = {
  fullBuffer : '',
  gotWelcomeMessage : false,
  authenticatedCallback : null,
  writeCallback : null,

  toUTF8 : ((window.Components && window.Components.classes) ? window.Components.classes["@mozilla.org/intl/utf8converterservice;1"].getService(window.Components.interfaces.nsIUTF8ConverterService)
                       : { convertStringToUTF8: function(str) { return str; } }),
  fromUTF8 : ((window.Components && window.Components.classes) ? window.Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].getService(window.Components.interfaces.nsIScriptableUnicodeConverter)
                         : { ConvertFromUnicode: function(str) { return str; }, Finish: function() { /* do nothing */ } }),

  _PROTO_ID : '2.0',
  _CLIENT_ID : 'ParamikoJS_',

  // todo fixme aes128-ctr is preferred on paramiko, but too slow for JS right now.  for now, using blowfish
  // working on optimizing this...
  _preferred_ciphers : [ 'blowfish-cbc', 'aes128-ctr', 'aes256-ctr', 'aes128-cbc', 'aes256-cbc', '3des-cbc',
                         'arcfour128', 'arcfour256' ],
  _preferred_macs : [ 'hmac-sha1', 'hmac-md5', 'hmac-sha1-96', 'hmac-md5-96' ],
  _preferred_keys : [ 'ssh-rsa', 'ssh-dss' ],
  _preferred_kex  : [ 'diffie-hellman-group14-sha1', 'diffie-hellman-group-exchange-sha1', 'diffie-hellman-group1-sha1' ],
  _preferred_compression : [ 'none' ],

  _cipher_info : {
    'aes128-ctr': { 'class': kryptos.cipher.AES, 'mode': kryptos.cipher.AES.MODE_CTR, 'block-size': 16, 'key-size': 16 },
    'aes256-ctr': { 'class': kryptos.cipher.AES, 'mode': kryptos.cipher.AES.MODE_CTR, 'block-size': 16, 'key-size': 32 },
    'blowfish-cbc': { 'class': kryptos.cipher.Blowfish, 'mode': kryptos.cipher.Blowfish.MODE_CBC, 'block-size': 8, 'key-size': 16 },
    'aes128-cbc': { 'class': kryptos.cipher.AES, 'mode': kryptos.cipher.AES.MODE_CBC, 'block-size': 16, 'key-size': 16 },
    'aes256-cbc': { 'class': kryptos.cipher.AES, 'mode': kryptos.cipher.AES.MODE_CBC, 'block-size': 16, 'key-size': 32 },
    '3des-cbc': { 'class': kryptos.cipher.DES3, 'mode': kryptos.cipher.DES3.MODE_CBC, 'block-size': 8, 'key-size': 24 },
    'arcfour128': { 'class': kryptos.cipher.ARC4, 'mode': null, 'block-size': 8, 'key-size': 16 },
    'arcfour256': { 'class': kryptos.cipher.ARC4, 'mode': null, 'block-size': 8, 'key-size': 32 }
  },

  _mac_info : {
    'hmac-sha1': { 'class': kryptos.hash.HMAC_SHA, 'size': 20 },
    'hmac-sha1-96': { 'class': kryptos.hash.HMAC_SHA, 'size': 12 },
    'hmac-md5': { 'class': kryptos.hash.HMAC_MD5, 'size': 16 },
    'hmac-md5-96': { 'class': kryptos.hash.HMAC_MD5, 'size': 12 }
  },

  _key_info : {
    'ssh-rsa': function(msg) { return new paramikojs.RSAKey(msg); },
    'ssh-dss': function(msg) { return new paramikojs.DSSKey(msg); }
  },

  _kex_info : {
    'diffie-hellman-group1-sha1': function(self) { return new paramikojs.KexGroup1(self); },
    'diffie-hellman-group14-sha1': function(self) { return new paramikojs.KexGroup14(self); },
    'diffie-hellman-group-exchange-sha1': function(self) { return new paramikojs.KexGex(self); }
  },

  _compression_info : {
    // zlib@openssh.com is just zlib, but only turned on after a successful
    // authentication.  openssh servers may only offer this type because
    // they've had troubles with security holes in zlib in the past.
    'zlib@openssh.com': [ paramikojs.ZlibCompressor, paramikojs.ZlibDecompressor ],
    'zlib': [ paramikojs.ZlibCompressor, paramikojs.ZlibDecompressor ],
    'none': [ null, null ]
  },

  _modulus_pack : null,


  /*
    Negotiate a new SSH2 session as a client.  This is the first step after
    creating a new L{Transport}.  A separate thread is created for protocol
    negotiation.

    If an event is passed in, this method returns immediately.  When
    negotiation is done (successful or not), the given C{Event} will
    be triggered.  On failure, L{is_active} will return C{False}.

    (Since 1.4) If C{event} is C{None}, this method will not return until
    negotation is done.  On success, the method returns normally.
    Otherwise an SSHException is raised.

    After a successful negotiation, you will usually want to authenticate,
    calling L{auth_password <Transport.auth_password>} or
    L{auth_publickey <Transport.auth_publickey>}.

    @note: L{connect} is a simpler method for connecting as a client.

    @note: After calling this method (or L{start_server} or L{connect}),
        you should no longer directly read from or write to the original
        socket object.

    @param event: an event to trigger when negotiation is complete
        (optional)
    @type event: threading.Event

    @raise SSHException: if negotiation fails (and no C{event} was passed
        in)
  */
  start_client : function() {
    this.active = true;
  },

  /*
    Close this session, and any open channels that are tied to it.
  */
  close : function() {
    if (!this.active) {
      return;
    }
    this.active = false;
    for (var x = 0; x < this._channels.length; ++x) {
      this._channels[x]._unlink();
    }
    this.packetizer.close();
  },

  /*
    Return the host key of the server (in client mode).

    @raise SSHException: if no session is currently active.
  */
  get_remote_server_key : function() {
    if (!this.active || !this.initial_kex_done) {
      throw new paramikojs.ssh_exception.SSHException('No existing session');
    }

    return this.host_key;
  },

  /*
    Return true if this session is active (open).
  */
  is_active : function() {
    return this.active;
  },

  /*
    Request a new channel to the server, of type C{"session"}.  This
    is just an alias for C{open_channel('session')}.

    @return: a new L{Channel}
    @rtype: L{Channel}

    @raise SSHException: if the request is rejected or the session ends
        prematurely
  */
  open_session : function(on_success) {
    return this.open_channel('session', null, null, on_success);
  },

  /*
    Request a new channel to the client, of type C{"x11"}.  This
    is just an alias for C{open_channel('x11', src_addr=src_addr)}.

    @param src_addr: the source address of the x11 server (port is the
        x11 port, ie. 6010)
    @type src_addr: (str, int)
    @return: a new L{Channel}
    @rtype: L{Channel}

    @raise SSHException: if the request is rejected or the session ends
        prematurely
  */
  open_x11_channel : function(src_addr) {
    return this.open_channel('x11', null, src_addr);
  },

  /*
    Request a new channel back to the client, of type C{"forwarded-tcpip"}.
    This is used after a client has requested port forwarding, for sending
    incoming connections back to the client.

    @param src_addr: originator's address
    @param src_port: originator's port
    @param dest_addr: local (server) connected address
    @param dest_port: local (server) connected port
  */
  open_forwarded_tcpip_channel : function(src_addr, src_port, dest_addr, dest_port) {
    return this.open_channel('forwarded-tcpip', [dest_addr, dest_port], [src_addr, src_port]);
  },

  /*
    Request a new channel to the server.  L{Channel}s are socket-like
    objects used for the actual transfer of data across the session.
    You may only request a channel after negotiating encryption (using
    L{connect} or L{start_client}) and authenticating.

    @param kind: the kind of channel requested (usually C{"session"},
        C{"forwarded-tcpip"}, C{"direct-tcpip"}, or C{"x11"})
    @type kind: str
    @param dest_addr: the destination address of this port forwarding,
        if C{kind} is C{"forwarded-tcpip"} or C{"direct-tcpip"} (ignored
        for other channel types)
    @type dest_addr: (str, int)
    @param src_addr: the source address of this port forwarding, if
        C{kind} is C{"forwarded-tcpip"}, C{"direct-tcpip"}, or C{"x11"}
    @type src_addr: (str, int)
    @return: a new L{Channel} on success
    @rtype: L{Channel}

    @raise SSHException: if the request is rejected or the session ends
        prematurely
  */
  open_channel : function(kind, dest_addr, src_addr, on_success) {
    if (!this.active) {
      throw new paramikojs.ssh_exception.SSHException('SSH session not active');
    }

    var chanid = this._next_channel();
    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_CHANNEL_OPEN));
    m.add_string(kind);
    m.add_int(chanid);
    m.add_int(this.window_size);
    m.add_int(this.max_packet_size);
    if (kind == 'forwarded-tcpip' || kind == 'direct-tcpip') {
      m.add_string(dest_addr[0]);
      m.add_int(dest_addr[1]);
      m.add_string(src_addr[0]);
      m.add_int(src_addr[1]);
    } else if (kind == 'x11') {
      m.add_string(src_addr[0]);
      m.add_int(src_addr[1]);
    }
    var chan = new paramikojs.Channel(chanid);
    this._channels[chanid] = chan;
    this._channels[chanid].on_success = on_success;
    this.channels_seen[chanid] = true;
    chan._set_transport(this);
    chan._set_window(this.window_size, this.max_packet_size);

    this._send_user_message(m);

    return chan;
  },

  /*
    Ask the server to forward TCP connections from a listening port on
    the server, across this SSH session.

    If a handler is given, that handler is called from a different thread
    whenever a forwarded connection arrives.  The handler parameters are::

        handler(channel, (origin_addr, origin_port), (server_addr, server_port))

    where C{server_addr} and C{server_port} are the address and port that
    the server was listening on.

    If no handler is set, the default behavior is to send new incoming
    forwarded connections into the accept queue, to be picked up via
    L{accept}.

    @param address: the address to bind when forwarding
    @type address: str
    @param port: the port to forward, or 0 to ask the server to allocate
        any port
    @type port: int
    @param handler: optional handler for incoming forwarded connections
    @type handler: function(Channel, (str, int), (str, int))
    @return: the port # allocated by the server
    @rtype: int

    @raise SSHException: if the server refused the TCP forward request
  */
  request_port_forward : function(address, port, handler) {
    if (!this.active) {
      throw new paramikojs.ssh_exception.SSHException('SSH session not active');
    }
    var response = this.global_request('tcpip-forward', [address, port], true);
    if (!response) {
      throw new paramikojs.ssh_exception.SSHException('TCP forwarding request denied');
    }
    if (port == 0) {
      port = response.get_int();
    }
    if (!handler) {
      var self = this;
      function default_handler(channel, src_addr, dest_addr) {
        self._queue_incoming_channel(channel);
      }
      handler = default_handler;
    }
    this._tcp_handler = handler;
    return port;
  },

  /*
    Ask the server to cancel a previous port-forwarding request.  No more
    connections to the given address & port will be forwarded across this
    ssh connection.

    @param address: the address to stop forwarding
    @type address: str
    @param port: the port to stop forwarding
    @type port: int
  */
  cancel_port_forward : function(address, port) {
    if (!this.active) {
      return;
    }
    this._tcp_handler = null;
    this.global_request('cancel-tcpip-forward', [address, port], true);
  },

  /*
    Create an SFTP client channel from an open transport.  On success,
    an SFTP session will be opened with the remote host, and a new
    SFTPClient object will be returned.

    @return: a new L{SFTPClient} object, referring to an sftp session
        (channel) across this transport
    @rtype: L{SFTPClient}
  */
  open_sftp_client : function(callback) {
    paramikojs.SFTPClient.from_transport(this, callback);
  },

  /*
    Send a junk packet across the encrypted link.  This is sometimes used
    to add "noise" to a connection to confuse would-be attackers.  It can
    also be used as a keep-alive for long lived connections traversing
    firewalls.

    @param bytes: the number of random bytes to send in the payload of the
        ignored packet -- defaults to a random number from 10 to 41.
    @type bytes: int
  */
  send_ignore : function(bytes) {
    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_IGNORE));
    if (!bytes) {
      bytes = (this.rng.read(1).charCodeAt(0) % 32) + 10;
    }
    m.add_bytes(this.rng.read(bytes));
    this._send_user_message(m);
  },

  /*
    Force this session to switch to new keys.  Normally this is done
    automatically after the session hits a certain number of packets or
    bytes sent or received, but this method gives you the option of forcing
    new keys whenever you want.  Negotiating new keys causes a pause in
    traffic both ways as the two sides swap keys and do computations.  This
    method returns when the session has switched to new keys.

    @raise SSHException: if the key renegotiation failed (which causes the
        session to end)
  */
  renegotiate_keys : function() {
    this._send_kex_init();
  },

  /*
    Turn on/off keepalive packets (default is off).  If this is set, after
    C{interval} seconds without sending any data over the connection, a
    "keepalive" packet will be sent (and ignored by the remote host).  This
    can be useful to keep connections alive over a NAT, for example.

    @param interval: seconds to wait before sending a keepalive packet (or
        0 to disable keepalives).
    @type interval: int
  */
  set_keepalive : function(interval) {
    var self = this;
    var callback = function() {
      self.global_request('keepalive@lag.net', null, false);
    };
    this.packetizer.set_keepalive(interval, callback);
  },

  /*
    Make a global request to the remote host.  These are normally
    extensions to the SSH2 protocol.

    @param kind: name of the request.
    @type kind: str
    @param data: an optional tuple containing additional data to attach
        to the request.
    @type data: tuple
    @param wait: C{True} if this method should not return until a response
        is received; C{False} otherwise.
    @type wait: bool
    @return: a L{Message} containing possible additional data if the
        request was successful (or an empty L{Message} if C{wait} was
        C{False}); C{None} if the request was denied.
    @rtype: L{Message}
  */
  global_request : function(kind, data, wait) {
    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_GLOBAL_REQUEST));
    m.add_string(kind);
    m.add_boolean(wait);
    if (data) {
      m.add(data);
    }
    if(ssh_console.debug) console.debug('Sending global request: ' + kind);
    this._send_user_message(m);
    return this.global_response;
  },

  /*
    Negotiate an SSH2 session, and optionally verify the server's host key
    and authenticate using a password or private key.  This is a shortcut
    for L{start_client}, L{get_remote_server_key}, and
    L{Transport.auth_password} or L{Transport.auth_publickey}.  Use those
    methods if you want more control.

    You can use this method immediately after creating a Transport to
    negotiate encryption with a server.  If it fails, an exception will be
    thrown.  On success, the method will return cleanly, and an encrypted
    session exists.  You may immediately call L{open_channel} or
    L{open_session} to get a L{Channel} object, which is used for data
    transfer.

    @note: If you fail to supply a password or private key, this method may
    succeed, but a subsequent L{open_channel} or L{open_session} call may
    fail because you haven't authenticated yet.

    @param hostkey: the host key expected from the server, or C{None} if
        you don't want to do host key verification.
    @type hostkey: L{PKey<pkey.PKey>}
    @param username: the username to authenticate as.
    @type username: str
    @param password: a password to use for authentication, if you want to
        use password authentication; otherwise C{None}.
    @type password: str
    @param pkey: a private key to use for authentication, if you want to
        use private key authentication; otherwise C{None}.
    @type pkey: L{PKey<pkey.PKey>}

    @raise SSHException: if the SSH2 negotiation fails, the host key
        supplied by the server is incorrect, or authentication fails.
  */
  connect : function(hostkey, authenticatedCallback, username, password, pkey, auth_success) {
    if (hostkey) {
      this._preferred_keys = [ hostkey.get_name() ];
    }

    this.start_client();

    this.authenticatedCallback = authenticatedCallback || function() {
      // check host key if we were given one
      var key = this.get_remote_server_key();
      if (hostkey) {
        if ((key.get_name() != hostkey.get_name()) || (key.toString() != hostkey.toString())) {
          if(ssh_console.debug) {
            console.debug('Bad host key from server');
            console.debug('Expected: %s: %s' + hostkey.get_name() + ':' + hostkey.toString());
            console.debug('Got     : %s: %s' + key.get_name() + ': ' + key.toString());
          }
          throw new paramikojs.ssh_exception.SSHException('Bad host key from server');
        }
        if(ssh_console.debug) console.debug('Host key verified (' + hostkey.get_name() + ')');
      }

      if (pkey || password) {
        if (password) {
          if(ssh_console.debug) console.debug('Attempting password auth...');
          this.auth_password(username, password);
        } else {
          if(ssh_console.debug) console.debug('Attempting public-key auth...');
          this.auth_publickey(username, pkey);
        }
      }
    };

    this.auth_callback = function(success, nextOptions, triedKeyboard, triedPublicKey) {
      if (success) {
        auth_success();
      } else if (nextOptions) {
        if (!triedKeyboard && nextOptions.indexOf('keyboard-interactive') != -1) {
          var handler = function(title, instructions, fields) {
            if (fields.length > 1) {
              throw new paramikojs.ssh_exception.SSHException('Fallback authentication failed.');
            }
            if (fields.length == 0) {
              // for some reason, at least on os x, a 2nd request will
              // be made with zero fields requested.  maybe it's just
              // to try to fake out automated scripting of the exact
              // type we're doing here.  *shrug* :)
              return [];
            }
            return [ password ];
          };
          this.auth_interactive(username, handler);
        } else if (!triedPublicKey && pkey && nextOptions.indexOf('publickey') != -1) {
          this.auth_publickey(username, pkey);
        } else {
          throw new paramikojs.ssh_exception.AuthenticationException('Authentication failed');
        }
      } else {
        throw new paramikojs.ssh_exception.AuthenticationException('Authentication failed');
      }
    };
  },

  /*
    Return any exception that happened during the last server request.
    This can be used to fetch more specific error information after using
    calls like L{start_client}.  The exception (if any) is cleared after
    this call.

    @return: an exception, or C{None} if there is no stored exception.
    @rtype: Exception

    @since: 1.1
  */
  get_exception : function() {
    var e = this.saved_exception;
    this.saved_exception = null;
    return e;
  },

  /*
    Return true if this session is active and authenticated.

    @return: True if the session is still open and has been authenticated
        successfully; False if authentication failed and/or the session is
        closed.
    @rtype: bool
  */
  is_authenticated : function() {
    return this.active && this.auth_handler && this.auth_handler.is_authenticated();
  },

  /*
    Return the username this connection is authenticated for.  If the
    session is not authenticated (or authentication failed), this method
    returns C{None}.

    @return: username that was authenticated, or C{None}.
    @rtype: string
  */
  get_username : function() {
    if (!this.active || !this.auth_handler) {
      return null;
    }
    return this.auth_handler.get_username();
  },

  /*
    Try to authenticate to the server using no authentication at all.
    This will almost always fail.  It may be useful for determining the
    list of authentication types supported by the server, by catching the
    L{BadAuthenticationType} exception raised.

    @param username: the username to authenticate as
    @type username: string
    @return: list of auth types permissible for the next stage of
        authentication (normally empty)
    @rtype: list

    @raise BadAuthenticationType: if "none" authentication isn't allowed
        by the server for this user
    @raise SSHException: if the authentication failed due to a network
        error

    @since: 1.5
  */
  auth_none : function(username) {
    if (!this.active || !this.initial_kex_done) {
      throw new paramikojs.ssh_exception.SSHException('No existing session');
    }
    this.auth_handler = new paramikojs.AuthHandler(this);
    this.auth_handler.auth_none(username);
    return this.auth_handler.wait_for_response();
  },

  /*
    Authenticate to the server using a password.  The username and password
    are sent over an encrypted link.

    If an C{event} is passed in, this method will return immediately, and
    the event will be triggered once authentication succeeds or fails.  On
    success, L{is_authenticated} will return C{True}.  On failure, you may
    use L{get_exception} to get more detailed error information.

    Since 1.1, if no event is passed, this method will block until the
    authentication succeeds or fails.  On failure, an exception is raised.
    Otherwise, the method simply returns.

    Since 1.5, if no event is passed and C{fallback} is C{True} (the
    default), if the server doesn't support plain password authentication
    but does support so-called "keyboard-interactive" mode, an attempt
    will be made to authenticate using this interactive mode.  If it fails,
    the normal exception will be thrown as if the attempt had never been
    made.  This is useful for some recent Gentoo and Debian distributions,
    which turn off plain password authentication in a misguided belief
    that interactive authentication is "more secure".  (It's not.)

    If the server requires multi-step authentication (which is very rare),
    this method will return a list of auth types permissible for the next
    step.  Otherwise, in the normal case, an empty list is returned.

    @param username: the username to authenticate as
    @type username: str
    @param password: the password to authenticate with
    @type password: str or unicode
    @param event: an event to trigger when the authentication attempt is
        complete (whether it was successful or not)
    @type event: threading.Event
    @param fallback: C{True} if an attempt at an automated "interactive"
        password auth should be made if the server doesn't support normal
        password auth
    @type fallback: bool
    @return: list of auth types permissible for the next stage of
        authentication (normally empty)
    @rtype: list

    @raise BadAuthenticationType: if password authentication isn't
        allowed by the server for this user (and no event was passed in)
    @raise AuthenticationException: if the authentication failed (and no
        event was passed in)
    @raise SSHException: if there was a network error
  */
  auth_password : function(username, password, event, fallback) {
    if (!this.active || !this.initial_kex_done) {
      // we should never try to send the password unless we're on a secure link
      throw new paramikojs.ssh_exception.SSHException('No existing session');
    }
    this.auth_handler = new paramikojs.AuthHandler(this);
    this.auth_handler.auth_password(username, password);
    return this.auth_handler.wait_for_response();
  },

  /*
    Authenticate to the server using a private key.  The key is used to
    sign data from the server, so it must include the private part.

    If an C{event} is passed in, this method will return immediately, and
    the event will be triggered once authentication succeeds or fails.  On
    success, L{is_authenticated} will return C{True}.  On failure, you may
    use L{get_exception} to get more detailed error information.

    Since 1.1, if no event is passed, this method will block until the
    authentication succeeds or fails.  On failure, an exception is raised.
    Otherwise, the method simply returns.

    If the server requires multi-step authentication (which is very rare),
    this method will return a list of auth types permissible for the next
    step.  Otherwise, in the normal case, an empty list is returned.

    @param username: the username to authenticate as
    @type username: string
    @param key: the private key to authenticate with
    @type key: L{PKey <pkey.PKey>}
    @param event: an event to trigger when the authentication attempt is
        complete (whether it was successful or not)
    @type event: threading.Event
    @return: list of auth types permissible for the next stage of
        authentication (normally empty)
    @rtype: list

    @raise BadAuthenticationType: if public-key authentication isn't
        allowed by the server for this user (and no event was passed in)
    @raise AuthenticationException: if the authentication failed (and no
        event was passed in)
    @raise SSHException: if there was a network error
  */
  auth_publickey : function(username, key) {
    if (!this.active || !this.initial_kex_done) {
      // we should never try to send the password unless we're on a secure link
      throw new paramikojs.ssh_exception.SSHException('No existing session');
    }
    this.auth_handler = new paramikojs.AuthHandler(this);
    this.auth_handler.auth_publickey(username, key);
    return this.auth_handler.wait_for_response();
  },

  /*
    Authenticate to the server interactively.  A handler is used to answer
    arbitrary questions from the server.  On many servers, this is just a
    dumb wrapper around PAM.

    This method will block until the authentication succeeds or fails,
    peroidically calling the handler asynchronously to get answers to
    authentication questions.  The handler may be called more than once
    if the server continues to ask questions.

    The handler is expected to be a callable that will handle calls of the
    form: C{handler(title, instructions, prompt_list)}.  The C{title} is
    meant to be a dialog-window title, and the C{instructions} are user
    instructions (both are strings).  C{prompt_list} will be a list of
    prompts, each prompt being a tuple of C{(str, bool)}.  The string is
    the prompt and the boolean indicates whether the user text should be
    echoed.

    A sample call would thus be:
    C{handler('title', 'instructions', [('Password:', False)])}.

    The handler should return a list or tuple of answers to the server's
    questions.

    If the server requires multi-step authentication (which is very rare),
    this method will return a list of auth types permissible for the next
    step.  Otherwise, in the normal case, an empty list is returned.

    @param username: the username to authenticate as
    @type username: string
    @param handler: a handler for responding to server questions
    @type handler: callable
    @param submethods: a string list of desired submethods (optional)
    @type submethods: str
    @return: list of auth types permissible for the next stage of
        authentication (normally empty).
    @rtype: list

    @raise BadAuthenticationType: if public-key authentication isn't
        allowed by the server for this user
    @raise AuthenticationException: if the authentication failed
    @raise SSHException: if there was a network error

    @since: 1.5
  */
  auth_interactive : function(username, handler, submethods) {
    if (!this.active || !this.initial_kex_done) {
      // we should never try to send the password unless we're on a secure link
      throw new paramikojs.ssh_exception.SSHException('No existing session');
    }
    this.auth_handler = new paramikojs.AuthHandler(this);
    this.auth_handler.auth_interactive(username, handler, submethods);
    return this.auth_handler.wait_for_response();
  },

  /*
    Turn on/off compression.  This will only have an affect before starting
    the transport (ie before calling L{connect}, etc).  By default,
    compression is off since it negatively affects interactive sessions.

    @param compress: C{True} to ask the remote client/server to compress
        traffic; C{False} to refuse compression
    @type compress: bool

    @since: 1.5.2
  */
  use_compression : function(compress) {
    if (compress) {
      this._preferred_compression = [ 'zlib@openssh.com', 'zlib', 'none' ];
    } else {
      this._preferred_compression = [ 'none', ];
    }
  },


  //  internals...

  // used by KexGex to find primes for group exchange
  _get_modulus_pack : function() {
    return this._modulus_pack;
  },

  _next_channel : function() {
    var chanid = this._channel_counter;
    while (this._channels[chanid]) {
      this._channel_counter = (this._channel_counter + 1) & 0xffffff;
      chanid = this._channel_counter;
    }
    this._channel_counter = (this._channel_counter + 1) & 0xffffff;
    return chanid;
  },

  // used by a Channel to remove itself from the active channel list;
  _unlink_channel : function(chanid) {
    delete this._channels[chanid];
  },

  _send_message : function(data) {
    this.packetizer.send_message(data);
  },

  /*
    send a message, but block if we're in key negotiation.  this is used
    for user-initiated requests.
  */
  _send_user_message : function(data) {
    if (!this.clear_to_send) {
      var self = this;
      var wait_callback = function() {
        self._send_user_message(data);
      };
      setTimeout(wait_callback, 100);
      return;
    }
    this._send_message(data);
  },

  // used by a kex object to set the K (root key) and H (exchange hash)
  _set_K_H : function(k, h) {
    this.K = k;
    this.H = h;
    if (!this.session_id) {
      this.session_id = h;
    }
  },

  // used by a kex object to register the next packet type it expects to see
  _expect_packet : function(ptypes) {
    this._expected_packet = [ptypes];
  },

  _verify_key : function(host_key, sig) {
    var key = this._key_info[this.host_key_type](new paramikojs.Message(host_key));
    if (!key) {
      throw new paramikojs.ssh_exception.SSHException('Unknown host key type');
    }
    if (!key.verify_ssh_sig(this.H, new paramikojs.Message(sig))) {
      throw new paramikojs.ssh_exception.SSHException('Signature verification (' + this.host_key_type + ') failed.');
    }
    this.host_key = key;
  },

  // id is 'A' - 'F' for the various keys used by ssh
  _compute_key : function(id, nbytes) {
    var m = new paramikojs.Message();
    m.add_mpint(this.K);
    m.add_bytes(this.H);
    m.add_byte(id);
    m.add_bytes(this.session_id);
    var out, sofar, digest;
    out = sofar = new kryptos.hash.SHA(m.toString()).digest();
    while (out.length < nbytes) {
      m = new paramikojs.Message();
      m.add_mpint(this.K);
      m.add_bytes(this.H);
      m.add_bytes(sofar);
      digest = new kryptos.hash.SHA(m.toString()).digest();
      out += digest;
      sofar += digest;
    }
    return out.substring(0, nbytes);
  },

  _get_cipher : function(name, key, iv) {
    if (!(name in this._cipher_info)) {
      throw new paramikojs.ssh_exception.SSHException('Unknown client cipher ' + name);
    }
    if (name in {'arcfour128': true, 'arcfour256': true}) {
      // arcfour cipher
      var cipher = new this._cipher_info[name]['class'](key);
      // as per RFC 4345, the first 1536 bytes of keystream
      // generated by the cipher MUST be discarded
      cipher.encrypt(new Array(1536 + 1).join(" "));
      return cipher;
    } else if (name.indexOf("-ctr") == name.length - 4) {
      // CTR modes, we need a counter
      var counter = new paramikojs.util.Counter(this._cipher_info[name]['block-size'] * 8, paramikojs.util.inflate_long(iv, true));
      return new this._cipher_info[name]['class'](key, this._cipher_info[name]['mode'], iv, counter);
    } else {
      return new this._cipher_info[name]['class'](key, this._cipher_info[name]['mode'], iv);
    }
  },

  _set_x11_handler : function(handler) {
    // only called if a channel has turned on x11 forwarding
    if (!handler) {
      // by default, use the same mechanism as accept()
      var self = this;
      var default_handler = function(channel, src_addr) {
        self._queue_incoming_channel(channel);
      }
      this._x11_handler = default_handler;
    } else {
      this._x11_handler = handler;
    }
  },

  run : function() {
    if (!this.active || (!this.gotWelcomeMessage && this.fullBuffer.indexOf('\n') == -1)) {
      return;
    }

    if (this.gotWelcomeMessage && this.packetizer.need_rekey() && !this.in_kex) {
      this._send_kex_init();
    }

    try {
      var msg = !this.gotWelcomeMessage ? "" : this.packetizer.read_message();
    } catch(ex) {
      if (ex instanceof paramikojs.ssh_exception.WaitException) {
        // not enough data yet to complete the packet, defer
        return;
      } else {
        throw ex;
      }
    }

    if (!this.gotWelcomeMessage) {
      this.gotWelcomeMessage = true;
      this._check_banner();
      this.packetizer.write_all(this.local_version + '\r\n');
      this._expect_packet(paramikojs.MSG_KEXINIT);
      this.nextCommand();
      return;
    } else if (msg.ptype == paramikojs.MSG_IGNORE) {
      this.nextCommand();
      return;
    } else if (msg.ptype == paramikojs.MSG_DISCONNECT) {
      this._parse_disconnect(msg.m);
      this.active = false;
      this.packetizer.close();
      return;
    } else if (msg.ptype == paramikojs.MSG_DEBUG) {
      this._parse_debug(msg.m);
      this.nextCommand();
      return;
    }

    if (this._expected_packet.length > 0) {
      if (this._expected_packet.indexOf(msg.ptype) == -1) {
        throw new paramikojs.ssh_exception.SSHException('Expecting packet from ' + this._expected_packet + ', got ' + msg.ptype);
      }
      this._expected_packet = [];
      if ((msg.ptype >= 30) && (msg.ptype <= 39)) {
        this.kex_engine.parse_next(msg.ptype, msg.m);
        this.nextCommand();
        return;
      }
    }

    if (msg.ptype in this._handler_table) {
      this._handler_table[msg.ptype](this, msg.m);
    } else if (msg.ptype in this._channel_handler_table) {
      var chanid = msg.m.get_int();
      var chan = this._channels[chanid];
      if (chan) {
        this._channel_handler_table[msg.ptype](chan, msg.m);
      } else if (chanid in this.channels_seen) {
        if(ssh_console.debug) console.debug('Ignoring message for dead channel ' + chanid);
      } else {
        if(ssh_console.debug) console.debug('Channel request for unknown channel ' + chanid);
        this.active = false;
        this.packetizer.close();
      }
    } else if (this.auth_handler && msg.ptype in this.auth_handler._handler_table) {
      this.auth_handler._handler_table[msg.ptype](this.auth_handler, msg.m);
    } else {
      if(ssh_console.warn) console.warn('Oops, unhandled type ' + msg.ptype);
      var nmsg = new paramikojs.Message();
      nmsg.add_byte(String.fromCharCode(paramikojs.MSG_UNIMPLEMENTED));
      nmsg.add_int(msg.m.seqno);
      this._send_message(nmsg);
    }

    this.nextCommand();
  },

  nextCommand : function() {
    if (this.fullBuffer) {    // leftover from previous packet
      this.run();
    }
  },


  //  protocol stages


  _negotiate_keys : function(m) {
    // throws SSHException on anything unusual
    this.clear_to_send = false;
    if (!this.local_kex_init) {
      // remote side wants to renegotiate
      this._send_kex_init();
    }
    this._parse_kex_init(m);
    this.kex_engine.start_kex();
  },

  _check_banner : function() {
    var buf = this.packetizer.readline();
    if (buf.substring(0, 4) != 'SSH-') {
      throw new paramikojs.ssh_exception.SSHException('Indecipherable protocol version "' + buf + '"');
    }
    // save this server version string for later
    this.remote_version = buf;
    // pull off any attached comment
    var comment = '';
    var i = buf.indexOf(' ');
    if (i >= 0) {
      comment = buf.substring(i + 1);
      buf = buf.substring(0, i);
    }
    // parse out version string and make sure it matches
    var segs = buf.split('-');
    if (segs.length < 3) {
      throw new paramikojs.ssh_exception.SSHException('Invalid SSH banner');
    }
    var version = segs[1];
    var client = segs[2];
    if (version != '1.99' && version != '2.0') {
      throw new paramikojs.ssh_exception.SSHException('Incompatible version (' + version + ' instead of 2.0)');
    }
    if(ssh_console.info) console.info('Connected (version ' + version + ', client ' + client + (comment ? + ', ' + comment : '') + ')', 'input', "info");
  },

  /*
    announce to the other side that we'd like to negotiate keys, and what
    kind of key negotiation we support.
  */
  _send_kex_init : function() {
    this.clear_to_send = false;
    this.in_kex = true;
    var available_server_keys = this._preferred_keys;

    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_KEXINIT));
    m.add_bytes(this.rng.read(16));
    m.add_list(this._preferred_kex);
    m.add_list(available_server_keys);
    m.add_list(this._preferred_ciphers);
    m.add_list(this._preferred_ciphers);
    m.add_list(this._preferred_macs);
    m.add_list(this._preferred_macs);
    m.add_list(this._preferred_compression);
    m.add_list(this._preferred_compression);
    m.add_string('');
    m.add_string('');
    m.add_boolean(false);
    m.add_int(0);
    // save a copy for later (needed to compute a hash)
    this.local_kex_init = m.toString();
    this._send_message(m);
  },

  _parse_kex_init : function(m) {
    var cookie = m.get_bytes(16);
    var kex_algo_list = m.get_list();
    var server_key_algo_list = m.get_list();
    var client_encrypt_algo_list = m.get_list();
    var server_encrypt_algo_list = m.get_list();
    var client_mac_algo_list = m.get_list();
    var server_mac_algo_list = m.get_list();
    var client_compress_algo_list = m.get_list();
    var server_compress_algo_list = m.get_list();
    var client_lang_list = m.get_list();
    var server_lang_list = m.get_list();
    var kex_follows = m.get_boolean();
    var unused = m.get_int();

    if(ssh_console.debug) {
      console.debug('kex algos: ' + kex_algo_list +
              '\nserver key: ' + server_key_algo_list +
              '\nclient encrypt: ' + client_encrypt_algo_list +
              '\nserver encrypt: ' + server_encrypt_algo_list +
              '\nclient mac: ' + client_mac_algo_list +
              '\nserver mac: ' + server_mac_algo_list +
              '\nclient compress: ' + client_compress_algo_list +
              '\nserver compress: ' + server_compress_algo_list +
              '\nclient lang: ' + client_lang_list +
              '\nserver lang: ' + server_lang_list +
              '\nkex follows? ' + kex_follows);
    }
    function filter(server, client) {
      var a = [];
      for (var x = 0; x < client.length; ++x) {
        if (server.indexOf(client[x]) != -1) {
          a.push(client[x]);
        }
      }
      return a;
    }

    // as a server, we pick the first item in the client's list that we support.
    // as a client, we pick the first item in our list that the server supports.
    var agreed_kex = filter(kex_algo_list, this._preferred_kex);
    if (!agreed_kex.length) {
      throw new paramikojs.ssh_exception.SSHException('Incompatible ssh peer (no acceptable kex algorithm)');
    }
    this.kex_engine = this._kex_info[agreed_kex[0]](this);

    var agreed_keys = filter(server_key_algo_list, this._preferred_keys);
    if (!agreed_keys.length) {
      throw new paramikojs.ssh_exception.SSHException('Incompatible ssh peer (no acceptable host key)');
    }
    this.host_key_type = agreed_keys[0];

    var agreed_local_ciphers = filter(client_encrypt_algo_list, this._preferred_ciphers);
    var agreed_remote_ciphers = filter(server_encrypt_algo_list, this._preferred_ciphers);
    if (!agreed_local_ciphers.length || !agreed_remote_ciphers.length) {
      throw new paramikojs.ssh_exception.SSHException('Incompatible ssh server (no acceptable ciphers)');
    }
    this.local_cipher = agreed_local_ciphers[0];
    this.remote_cipher = agreed_remote_ciphers[0];
    if(ssh_console.debug) console.debug('Ciphers agreed: local=' + this.local_cipher + ', remote=' + this.remote_cipher);

    var agreed_local_macs = filter(client_mac_algo_list, this._preferred_macs);
    var agreed_remote_macs = filter(server_mac_algo_list, this._preferred_macs);
    if (!agreed_local_macs.length || !agreed_remote_macs.length) {
      throw new paramikojs.ssh_exception.SSHException('Incompatible ssh server (no acceptable macs)');
    }
    this.local_mac = agreed_local_macs[0];
    this.remote_mac = agreed_remote_macs[0];

    var agreed_local_compression = filter(client_compress_algo_list, this._preferred_compression);
    var agreed_remote_compression = filter(server_compress_algo_list, this._preferred_compression);
    if (!agreed_local_compression.length || !agreed_remote_compression.length) {
      throw new paramikojs.ssh_exception.SSHException('Incompatible ssh server (no acceptable compression) ' + agreed_local_compression + ' ' + agreed_remote_compression + ' ' + this._preferred_compression);
    }
    this.local_compression = agreed_local_compression[0];
    this.remote_compression = agreed_remote_compression[0];

    if(ssh_console.debug) console.debug('using kex: ' + agreed_kex[0]
      + '\nserver key type: ' + this.host_key_type
      + '\ncipher: local ' + this.local_cipher + ', remote ' + this.remote_cipher
      + '\nmac: local ' + this.local_mac + ', remote ' + this.remote_mac
      + '\ncompression: local ' + this.local_compression + ', remote ' + this.remote_compression);

    // save for computing hash later...
    // now wait!  openssh has a bug (and others might too) where there are
    // actually some extra bytes (one NUL byte in openssh's case) added to
    // the end of the packet but not parsed.  turns out we need to throw
    // away those bytes because they aren't part of the hash.
    this.remote_kex_init = String.fromCharCode(paramikojs.MSG_KEXINIT) + m.get_so_far();
  },

  // switch on newly negotiated encryption parameters for inbound traffic
  _activate_inbound : function() {
    var block_size = this._cipher_info[this.remote_cipher]['block-size'];
    var IV_in = this._compute_key('B', block_size);
    var key_in = this._compute_key('D', this._cipher_info[this.remote_cipher]['key-size']);
    var engine = this._get_cipher(this.remote_cipher, key_in, IV_in);
    var mac_size = this._mac_info[this.remote_mac]['size'];
    var mac_engine = this._mac_info[this.remote_mac]['class'];
    // initial mac keys are done in the hash's natural size (not the potentially truncated
    // transmission size)
    var mac_key = this._compute_key('F', mac_engine.digest_size);
    this.packetizer.set_inbound_cipher(engine, block_size, mac_engine, mac_size, mac_key);
    var compress_in = this._compression_info[this.remote_compression][1];
    if (compress_in && (this.remote_compression != 'zlib@openssh.com' || this.authenticated)) {
      if(ssh_console.debug) console.debug('Switching on inbound compression ...');
      this.packetizer.set_inbound_compressor(new compress_in());
    }
  },

  // switch on newly negotiated encryption parameters for outbound traffic
  _activate_outbound : function() {
    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_NEWKEYS));
    this._send_message(m);
    var block_size = this._cipher_info[this.local_cipher]['block-size'];
    var IV_out = this._compute_key('A', block_size);
    var key_out = this._compute_key('C', this._cipher_info[this.local_cipher]['key-size']);
    var engine = this._get_cipher(this.local_cipher, key_out, IV_out);
    var mac_size = this._mac_info[this.local_mac]['size'];
    var mac_engine = this._mac_info[this.local_mac]['class'];
    // initial mac keys are done in the hash's natural size (not the potentially truncated
    // transmission size)
    var mac_key = this._compute_key('E', mac_engine.digest_size);
    this.packetizer.set_outbound_cipher(engine, block_size, mac_engine, mac_size, mac_key);
    var compress_out = this._compression_info[this.local_compression][0];
    if (compress_out && (this.local_compression != 'zlib@openssh.com' || this.authenticated)) {
      if(ssh_console.debug) console.debug('Switching on outbound compression ...');
      this.packetizer.set_outbound_compressor(new compress_out());
    }
    if (!this.packetizer.need_rekey()) {
      this.in_kex = false;
    }
    // we always expect to receive NEWKEYS now
    this._expect_packet(paramikojs.MSG_NEWKEYS);
  },

  _auth_trigger : function() {
    this.authenticated = true;
    // delayed initiation of compression
    if (this.local_compression == 'zlib@openssh.com') {
      var compress_out = this._compression_info[this.local_compression][0];
      if(ssh_console.debug) console.debug('Switching on outbound compression ...');
      this.packetizer.set_outbound_compressor(new compress_out());
    }
    if (this.remote_compression == 'zlib@openssh.com') {
      var compress_in = this._compression_info[this.remote_compression][1];
      if(ssh_console.debug) console.debug('Switching on inbound compression ...');
      this.packetizer.set_inbound_compressor(new compress_in());
    }
  },

  _parse_newkeys : function(m) {
    if(ssh_console.debug) console.debug('Switch to new keys ...');
    this._activate_inbound();
    // can also free a bunch of stuff here
    this.local_kex_init = this.remote_kex_init = null;
    this.K = null
    this.kex_engine = null
    if (!this.initial_kex_done) {
      // this was the first key exchange
      this.initial_kex_done = true;
    }
    // it's now okay to send data again (if this was a re-key)
    if (!this.packetizer.need_rekey()) {
      this.in_kex = false;
    }

    this.clear_to_send = true;

    if (this.authenticatedCallback) {
      this.authenticatedCallback();
      this.authenticatedCallback = null;
    }
  },

  _parse_disconnect : function(m) {
    var code = m.get_int();
    var desc = m.get_string();
    if(ssh_console.info) console.info('Disconnect (code ' + code + '): ' + desc);
  },

  _parse_global_request : function(m) {
    var kind = m.get_string();
    if(ssh_console.debug) console.debug('Received global request ' + kind);
    var want_reply = m.get_boolean();
    var ok = false;
    if(ssh_console.debug) console.debug('Rejecting "' + kind + '" global request from server.');
    var extra = [];
    if (want_reply) {
      var msg = new paramikojs.Message();
      msg.add_byte(String.fromCharCode(paramikojs.MSG_REQUEST_FAILURE));
      this._send_message(msg);
    }
  },

  _parse_request_success : function(m) {
    if(ssh_console.debug) console.debug('Global request successful.');
    this.global_response = m;
  },

  _parse_request_failure : function(m) {
    if(ssh_console.debug) console.debug('Global request denied.');
    this.global_response = null;
  },

  _parse_channel_open_success : function(m) {
    var chanid = m.get_int();
    var server_chanid = m.get_int();
    var server_window_size = m.get_int();
    var server_max_packet_size = m.get_int();
    var chan = this._channels[chanid];
    if (!chan) {
      if(ssh_console.debug) console.debug('Success for unrequested channel! [??]');
      return;
    }
    chan._set_remote_channel(server_chanid, server_window_size, server_max_packet_size);
    if(ssh_console.info) console.info('Secsh channel ' + chanid + ' opened.');
    if (chan.on_success) {
      chan.on_success(chan);
    }
  },

  _parse_channel_open_failure : function(m) {
    var chanid = m.get_int();
    var reason = m.get_int();
    var reason_str = m.get_string();
    var lang = m.get_string();
    var reason_text = reason in paramikojs.CONNECTION_FAILED_CODE ? paramikojs.CONNECTION_FAILED_CODE[reason] : '(unknown code)';
    if(ssh_console.info) console.info('Secsh channel ' + chanid + ' open FAILED: ' + reason_str + ': ' + reason_text);

    this.saved_exception = new paramikojs.ssh_exception.ChannelException(reason, reason_text);
  },

  _parse_channel_open : function(m) {
    var kind = m.get_string();
    var chanid = m.get_int();
    var initial_window_size = m.get_int();
    var max_packet_size = m.get_int();
    var reject = false;
    var origin_addr, origin_port;
    var server_addr, server_port;
    var mychanid;
    if (kind == 'x11' && this._x11_handler) {
      origin_addr = m.get_string();
      origin_port = m.get_int();
      if(ssh_console.debug) console.debug('Incoming x11 connection from ' + origin_addr + ':' + origin_port);
      my_chanid = this._next_channel();
    } else if (kind == 'forwarded-tcpip' && this._tcp_handler) {
      server_addr = m.get_string();
      server_port = m.get_int();
      origin_addr = m.get_string();
      origin_port = m.get_int();
      if(ssh_console.debug) console.debug('Incoming tcp forwarded connection from ' + origin_addr + ':' + origin_port);
      my_chanid = this._next_channel();
    } else {
      if(ssh_console.debug) console.debug('Rejecting "' + kind + '" channel request from server.');
      reject = true;
      reason = paramikojs.OPEN_FAILED_ADMINISTRATIVELY_PROHIBITED;
    }

    if (reject) {
      var msg = new paramikojs.Message();
      msg.add_byte(String.fromCharCode(paramikojs.MSG_CHANNEL_OPEN_FAILURE));
      msg.add_int(chanid);
      msg.add_int(reason);
      msg.add_string('');
      msg.add_string('en');
      this._send_message(msg);
      return;
    }

    var chan = new Channel(my_chanid);
    this._channels[my_chanid] = chan;
    this.channels_seen[my_chanid] = true;
    chan._set_transport(this);
    chan._set_window(this.window_size, this.max_packet_size);
    chan._set_remote_channel(chanid, initial_window_size, max_packet_size);

    var m = new paramikojs.Message();
    m.add_byte(String.fromCharCode(paramikojs.MSG_CHANNEL_OPEN_SUCCESS));
    m.add_int(chanid);
    m.add_int(my_chanid);
    m.add_int(this.window_size);
    m.add_int(this.max_packet_size);
    this._send_message(m);
    if(ssh_console.info) console.info('Secsh channel ' + my_chanid + ' (' + kind + ') opened.');
    if (kind == 'x11') {
      this._x11_handler(chan, [origin_addr, origin_port]);
    } else if (kind == 'forwarded-tcpip') {
      chan.origin_addr = [origin_addr, origin_port];
      this._tcp_handler(chan, [origin_addr, origin_port], [server_addr, server_port]);
    } else {
      this._queue_incoming_channel(chan);
    }
  },

  _parse_debug : function(m) {
    var always_display = m.get_boolean();
    var msg = m.get_string();
    var lang = m.get_string();
    if(ssh_console.debug) console.debug('Debug msg: ' + paramikojs.util.safe_string(msg));
  },

  _get_subsystem_handler : function(name) {
    if (name in this.subsystem_table) {
      return this.subsystem_table[name];
    }
    return [None, [], {}];
  },

  _handler_table : {
    21: function(self, m) { self._parse_newkeys(m); },
    80: function(self, m) { self._parse_global_request(m); },
    81: function(self, m) { self._parse_request_success(m); },
    82: function(self, m) { self._parse_request_failure(m); },
    91: function(self, m) { self._parse_channel_open_success(m); },
    92: function(self, m) { self._parse_channel_open_failure(m); },
    90: function(self, m) { self._parse_channel_open(m); },
    20: function(self, m) { self._negotiate_keys(m); }
  },

  _channel_handler_table : {
    99:  function(chan, m) { chan._request_success(m); },
    100: function(chan, m) { chan._request_failed(m); },
    94:  function(chan, m) { chan._feed(m); },
    95:  function(chan, m) { chan._feed_extended(m); },
    93:  function(chan, m) { chan._window_adjust(m); },
    98:  function(chan, m) { chan._handle_request(m); },
    96:  function(chan, m) { chan._handle_eof(m); },
    97:  function(chan, m) { chan._handle_close(m); }
  }
};

// Source: unknown_key.js
/*
  Representation of a key that we don't know about.
*/
paramikojs.UnknownKey = function(keytype, key) {
  inherit(this, new paramikojs.PKey());

  this.keytype = keytype;
  this.key = key;
}

paramikojs.UnknownKey.prototype = {
  toString : function() {
    return this.key;
  },

  compare : function(other) {
    if (this.get_name() != other.get_name()) {
      return false;
    }
    if (this.key != other.key) {
      return false;
    }
    return true;
  },

  get_name : function() {
    return this.keytype;
  }
};


// Source: util.js
paramikojs.util = {};

paramikojs.util.inflate_long = function(s, always_positive) {
  var out = new BigInteger("0", 10);
  var negative = 0;
  if (!always_positive && s.length > 0 && s.charCodeAt(0) >= 0x80) {
    negative = 1;
  }
  if (s.length % 4) {
    var filler = '\x00';
    if (negative) {
      filler = '\xff';
    }
    s = new Array(4 - s.length % 4 + 1).join(filler) + s;
  }
  for (var i = 0; i < s.length; i += 4) {
    out = out.shiftLeft(32);
    out = out.add(new BigInteger(struct.unpack('>I', s.substring(i, i+4))[0].toString(), 10));
  }
  if (negative) {
    var one = new BigInteger("1", 10);
    out = one.shiftLeft(8 * s.length);
    out = out.subtract(one);
  }
  return out;
};

paramikojs.util.deflate_long = function(n, add_sign_padding) {
  n = typeof n == "number" ? new BigInteger(n.toString(), 10) : n.clone();
  add_sign_padding = add_sign_padding == undefined ? true : add_sign_padding;
  var s = '';
  var negOne = new BigInteger("-1", 10);
  var bottom32BitMask = new BigInteger("ffffffff", 16);
  while (!n.equals(BigInteger.ZERO) && !n.equals(negOne)) {
    s = struct.pack('>I', n.and(bottom32BitMask)) + s;
    n = n.shiftRight(32);
  }
  // strip off leading zeros, FFs
  var found = false;
  var i = 0;
  for (; i < s.length; ++i) {
    if (n.equals(BigInteger.ZERO) && s.charAt(i) != '\000') {
      found = true;
      break;
    }
    if (n.equals(negOne) && s.charAt(i) != '\xff') {
      found = true;
      break;
    }
  }
  if (!found) {
    // degenerate case, n was either 0 or -1
    i = 0;
    if (n.equals(BigInteger.ZERO)) {
      s = '\000';
    } else {
      s = '\xff';
    }
  }
  s = s.substring(i);
  if (add_sign_padding) {
    if (n.equals(BigInteger.ZERO) && s.charCodeAt(0) >= 0x80) {
      s = '\x00' + s;
    }
    if (n.equals(negOne) && s.charCodeAt(0) < 0x80) {
      s = '\xff' + s;
    }
  }
  return s;
};

paramikojs.util.format_binary_weird = function(data) {
  var out = '';
  for (var x = 0; x < data.length; ++x) {
    var i = data[x];
    out += '%02X' % i[1].charCodeAt(0);
    if (i[0] % 2) {
      out += ' ';
    }
    if (i[0] % 16 == 15) {
      out += '\n';
    }
  }
  return out;
};

paramikojs.util.format_binary = function(data, prefix) {
  prefix = prefix || '';
  var x = 0;
  var out = [];
  while (data.length > x + 16) {
    out.push(paramikojs.util.format_binary_line(data.substring(x, x+16)));
    x += 16;
  }
  if (x < data.length) {
    out.push(paramikojs.util.format_binary_line(data.substring(x)));
  }
  var ret = [];
  for (var i = 0; i < out.length; ++i) {
    ret.push(prefix + out[i]);
  }
  return '\n' + ret.join('\n');
};

paramikojs.util.format_binary_line = function(data) {
	var left = paramikojs.util.hexify(data, ' ');
  left = left.length < 50 ? left + new Array(50 - left.length + 1).join('&nbsp;') : left;
  var right = "";
  for (var x = 0; x < data.length; ++x) {
    var c = data[x];
    right += parseInt((c.charCodeAt(0) + 63) / 95) == 1 ? c : '.';
  }
  return left + ' ' + right;
};

paramikojs.util.hexify = function(s, padding) {
	return binascii.hexlify(s, padding).toUpperCase();
};

paramikojs.util.unhexify = function(s) {
	return binascii.unhexlify(s);
};

paramikojs.util.safe_string = function (s) {
	out = '';
  for (var x = 0; x < s.length; ++x) {
    var c = s[x];
    if (c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 127) {
      out += c;
    } else {
      out += '%' + c.charCodeAt(0) + ' ';
    }
  }
  return out;
};

// ''.join([['%%%02X' % ord(c), c][(ord(c) >= 32) and (ord(c) <= 127)] for c in s])

paramikojs.util.bit_length = function(n) {
	var norm = paramikojs.util.deflate_long(n, 0);
  var hbyte = norm[0].charCodeAt(0);
  if (hbyte == 0) {
    return 1;
  }
  var bitlen = norm.length * 8;
  while (!(hbyte & 0x80)) {
    hbyte <<= 1;
    bitlen -= 1;
  }
  return bitlen;
};

paramikojs.util.tb_strings = function() {
	return '';  // todo print stack
};

/*
  Given a password, passphrase, or other human-source key, scramble it
  through a secure hash into some keyworthy bytes.  This specific algorithm
  is used for encrypting/decrypting private key files.

  @param hashclass: class from L{Crypto.Hash} that can be used as a secure
      hashing function (like C{MD5} or C{SHA}).
  @type hashclass: L{Crypto.Hash}
  @param salt: data to salt the hash with.
  @type salt: string
  @param key: human-entered password or passphrase.
  @type key: string
  @param nbytes: number of bytes to generate.
  @type nbytes: int
  @return: key data
  @rtype: string
*/
paramikojs.util.generate_key_bytes = function(hashclass, salt, key, nbytes) {
  var keydata = '';
  var digest = '';
  if (salt.length > 8) {
    salt = salt.substring(0, 8);
  }
  while (nbytes > 0) {
    var hash_obj = new hashclass();
    if (digest.length > 0) {
      hash_obj.update(digest);
    }
    hash_obj.update(key);
    hash_obj.update(salt);
    digest = hash_obj.digest();
    var size = Math.min(nbytes, digest.length);
    keydata += digest.substring(0, size);
    nbytes -= size;
  }
  return keydata;
};

/*
  Read a file of known SSH host keys, in the format used by openssh, and
  return a compound dict of C{hostname -> keytype ->} L{PKey <paramiko.pkey.PKey>}.
  The hostname may be an IP address or DNS name.  The keytype will be either
  C{"ssh-rsa"} or C{"ssh-dss"}.

  This type of file unfortunately doesn't exist on Windows, but on posix,
  it will usually be stored in C{os.path.expanduser("~/.ssh/known_hosts")}.

  Since 1.5.3, this is just a wrapper around L{HostKeys}.

  @param filename: name of the file to read host keys from
  @type filename: str
  @return: dict of host keys, indexed by hostname and then keytype
  @rtype: dict(hostname, dict(keytype, L{PKey <paramiko.pkey.PKey>}))
*/
paramikojs.util.load_host_keys = function(filename) {
  return new paramikojs.HostKeys(filename);
};

/*
  Provided only as a backward-compatible wrapper around L{SSHConfig}.
*/
paramikojs.util.parse_ssh_config = function(file_obj) {
  var config = new paramikojs.SSHConfig();
  config.parse(file_obj);
  return config;
};

/*
  Provided only as a backward-compatible wrapper around L{SSHConfig}.
*/
paramikojs.util.lookup_ssh_host_config = function(hostname, config) {
  return config.lookup(hostname);
};

paramikojs.util.mod_inverse = function(x, m) {
  var u1 = 1; var u2 = 0; var u3 = m;
  var v1 = 0; var v2 = 1; var v3 = x;

  while (v3 > 0) {
    var q = parseInt(u3 / v3);
    var t = v1;
    v1 = u1 - v1 * q;
    u1 = t;
    t  = v2;
    v2 = u2 - v2 * q;
    u2 = t;
    t  = v3;
    v3 = u3 - v3 * q;
    u3 = t;
  }
  if (u2 < 0) {
    u2 += m;
  }
  return u2;
};

// Stateful counter for CTR mode crypto
paramikojs.util.Counter = function(nbits, initial_value, overflow) {
  initial_value = initial_value == undefined ? 1 : initial_value;
  overflow = overflow || 0;
  this.blocksize = nbits / 8;
  this.overflow = overflow;
  // start with value - 1 so we don't have to store intermediate values when counting
  // could the iv be 0?
  if (initial_value == 0) {
    this.value = new Array(this.blocksize + 1).join('\xFF');
  } else {
    var one = BigInteger.ONE;
    var x = paramikojs.util.deflate_long(initial_value.subtract(one), false);
    this.value = new Array(this.blocksize - x.length + 1).join('\x00') + x;
  }
};

paramikojs.util.Counter.prototype = {
  // Increment the counter and return the new value
  call : function() {
    var i = this.blocksize - 1;
    while (i > -1) {
      var c = String.fromCharCode((this.value.charCodeAt(i) + 1) % 256);
      this.value = paramikojs.util.setCharAt(this.value, i, c);
      if (c != '\x00') {
        return this.value;
      }
      i -= 1;
    }
    // counter reset
    var x = paramikojs.util.deflate_long(this.overflow, false);
    this.value = new Array(this.blocksize - x.length + 1).join('\x00') + x;
    return this.value;
  }
};

paramikojs.util.setCharAt = function(str, index, ch) {    // how annoying
  return str.substr(0, index) + ch + str.substr(index + 1);
};

// Source: win_pageant.js
paramikojs.win_pageant = function() {

};

paramikojs.win_pageant.prototype = {
  _AGENT_COPYDATA_ID : 0x804e50ba,
  _AGENT_MAX_MSGLEN : 8192,
  // Note: The WM_COPYDATA value is pulled from win32con, as a workaround
  // so we do not have to import this huge library just for this one variable.
  win32con_WM_COPYDATA : 74,

  _get_pageant_window_object : function() {
    return ctypes.windll.user32.FindWindowA('Pageant', 'Pageant'); // todo fixme
  },

  /*
    Check to see if there is a "Pageant" agent we can talk to.

    This checks both if we have the required libraries (win32all or ctypes)
    and if there is a Pageant currently running.
  */
  can_talk_to_agent : function() {
    if (this._get_pageant_window_object()) {
      return true;
    }
    return false;
  },

  _query_pageant : function(msg) {
    var hwnd = _get_pageant_window_object();  // todo fixme this whole thing!
    if (!hwnd) {
      // Raise a failure to connect exception, pageant isn't running anymore!
      return null;
    }

    // Write our pageant request string into the file (pageant will read this to determine what to do)
    var filename = tempfile.mktemp('.pag');   // todo fixme
    var map_filename = os.path.basename(filename); // todo fixme

    var f = open(filename, 'w+b');  // todo fixme
    f.write(msg);
    // Ensure the rest of the file is empty, otherwise pageant will read this
    f.write('\0' * (this._AGENT_MAX_MSGLEN - msg.length));
    // Create the shared file map that pageant will use to read from
    var pymap = mmap.mmap(f.fileno(), this._AGENT_MAX_MSGLEN, tagname=map_filename, access=mmap.ACCESS_WRITE);
    try {
      // Create an array buffer containing the mapped filename
      var char_buffer = array.array("c", map_filename + '\0');
      char_buffer_address, char_buffer_size = char_buffer.buffer_info();
      // Create a string to use for the SendMessage function call
      cds = struct.pack("LLP", this._AGENT_COPYDATA_ID, char_buffer_size, char_buffer_address);

      _buf = array.array('B', cds);
      _addr, _size = _buf.buffer_info();
      response = ctypes.windll.user32.SendMessageA(hwnd, win32con_WM_COPYDATA, _size, _addr);

      if (response > 0) {
        datalen = pymap.read(4);
        retlen = struct.unpack('>I', datalen)[0];
        return datalen + pymap.read(retlen);
      }
      return null;
    } catch(ex) {
    } finally {
      pymap.close();
      f.close();
      // Remove the file, it was temporary only
      os.unlink(filename);
    }
  },

  /*
    Mock "connection" to an agent which roughly approximates the behavior of
    a unix local-domain socket (as used by Agent).  Requests are sent to the
    pageant daemon via special Windows magick, and responses are buffered back
    for subsequent reads.
  */
  PageantConnection : {
    response : null,

    send : function(data) {
      this._response = paramikojs.win_pageant._query_pageant(data);
    },

    recv : function(n) {
      if (!this._response) {
        return '';
      }
      ret = this._response.substring(0, n);
      this._response = this._response.substring(n);
      if (this._response == '') {
        this._response = null;
      }
      return ret;
    },

    close : function() {}
  }
};

return paramikojs;

});

