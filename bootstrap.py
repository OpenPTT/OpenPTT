#!/usr/bin/env python2

import os
import sys
import argparse
from subprocess import call

def check_cmd(cmdList):
    installed = True
    devnull = open(os.devnull, "wb")

    try:
        call(cmdList, stdout=devnull, stderr=devnull)
    except OSError as e:
        if e.errno == os.errno.ENOENT:
            installed = False

    return installed

def bootstrap():
    # Check dependencies
    nodejs_has_installed = check_cmd(["node", "--version"]);
    npm_has_installed = check_cmd(["npm", "--version"]);

    if not nodejs_has_installed:
        print("nodejs has not installed, please install before building")
    if not npm_has_installed:
        print("npm has not installed, please install before building")

    # Return if dependencies not satisfy requirement
    if (not nodejs_has_installed) and (not npm_has_installed):
        return 1

    print("====")
    print("Running 'npm install'...")
    print("====")
    call(["npm", "install"])

    # Add cordova plugins
    print("====")
    print("Adding cordova plugins...")
    print("====")
    call(["cordova", "plugin", "add", "https://github.com/blocshop/sockets-for-cordova"])
    call(["cordova", "plugin", "add", "cordova-plugin-console"])
    call(["cordova", "plugin", "add", "cordova-plugin-globalization"])

    # Run grunt
    print("====")
    print("Running 'grunt'...")
    print("====")
    call(["grunt"])

    return 0

def cli(args):
    parser = argparse.ArgumentParser()
    parser.add_argument("--bootstrap", action="store_true", 
                        help="Prepare for build")
    parser.add_argument("--android", action="store_true", 
                        help="Add Android as target")
    parser.add_argument("--ios", action="store_true",
                        help="Add ios as target")
    parser.add_argument("--win-phone-8", action="store_true",
                        help="Add Windows phone as target")
    parser.add_argument("--windows", action="store_true",
                        help="Add Windows/Windows phone 8.1 as target")

    # If no arguemnt
    if len(args) is 0:
        parser.print_usage()
        return 0

    args = parser.parse_args(args)

    # Add node_module/.bin to PATH
    os.environ["PATH"] = "./node_modules/.bin:" + os.environ["PATH"]

    if args.bootstrap:
        flag = bootstrap()
        if flag:
            return 1

    # Build for android
    if args.android:
        print("====")
        print("Starting to build Android target...")
        print("====")
        call(["cordova", "platform", "add", "android"])
        call(["cordova", "build", "android"])

    # Build for iOS
    if args.ios:
        print("====")
        print("Starting to build iOS target...")
        print("====")
        call(["cordova", "platform", "add", "ios"])
        call(["cordova", "build", "ios"])

    # Build for Windows phone 8
    if args.win_phone_8:
        print("====")
        print("Starting to build Windows phone 8 target...")
        print("====")
        call(["cordova", "platform", "add", "wp8"])
        print("'VS2013\Solution Explorer\CordovaApp.Phone\Deploy' yourself")

    # Build for Windows
    if args.windows:
        print("====")
        print("Starting to build Windows target...")
        print("====")
        call(["cordova", "platform", "add", "windows"])
        print("'VS2013\Solution Explorer\CordovaApp.Phone\Deploy' yourself")

if __name__ == "__main__":
    exit(cli(sys.argv[1:]))
