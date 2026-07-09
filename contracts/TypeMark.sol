// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TypeMark {
    uint256 public nextMarkId = 1;

    struct Mark {
        address maker;
        string phrase;
        string styleName;
        string ink;
        string note;
        uint256 createdAt;
    }

    mapping(uint256 => Mark) private marks;

    event MarkStamped(
        uint256 indexed markId,
        address indexed maker,
        string phrase,
        string styleName,
        string ink
    );

    function stampMark(
        string calldata phrase,
        string calldata styleName,
        string calldata ink,
        string calldata note
    ) external returns (uint256 markId) {
        require(bytes(phrase).length > 0 && bytes(phrase).length <= 64, "Invalid phrase");
        require(bytes(styleName).length > 0 && bytes(styleName).length <= 24, "Invalid style");
        require(bytes(ink).length > 0 && bytes(ink).length <= 24, "Invalid ink");
        require(bytes(note).length > 0 && bytes(note).length <= 120, "Invalid note");

        markId = nextMarkId++;
        marks[markId] = Mark({
            maker: msg.sender,
            phrase: phrase,
            styleName: styleName,
            ink: ink,
            note: note,
            createdAt: block.timestamp
        });

        emit MarkStamped(markId, msg.sender, phrase, styleName, ink);
    }

    function getMark(
        uint256 markId
    )
        external
        view
        returns (
            address maker,
            string memory phrase,
            string memory styleName,
            string memory ink,
            string memory note,
            uint256 createdAt
        )
    {
        Mark storage entry = marks[markId];
        return (
            entry.maker,
            entry.phrase,
            entry.styleName,
            entry.ink,
            entry.note,
            entry.createdAt
        );
    }
}
