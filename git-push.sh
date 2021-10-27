#!/bin/bash

SEMVER_REGEX='^(v?[[:digit:]]+\.[[:digit:]]+\.[[:digit:]]+)(-(beta|rc)(((\+|\.)[[:alnum:]]+)*)?)?$'

TAG=$1
if [[ -z "${TAG}" ]]; then
    echo "Usage: git-push.sh {SEMVER_TAG}"
    echo "e.g git-push.sh v1.1.1"
    echo "    git-push.sh 3.0.233-beta.1"
    exit 1
fi

if ! (echo "${TAG-xxx}" | grep -qE "$SEMVER_REGEX"); then
    echo "Error: The tag is not a valid semantic version. See https://semver.org"
    exit 1
fi

(git tag | xargs git tag -d) && git tag $TAG && git push origin dev && git push origin $TAG