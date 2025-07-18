// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}


contract Fundraisers {

    enum ProgramStatus { INACTIVE, REGISTERED, ALLOCATED, FINISHED }

    struct Program {
        uint256 id;
        string name;
        string picName;
        uint256 target;
        string desc;
        address pic;
        ProgramStatus status;
        uint256 allocated;
        string category;
        string programLink;
        string photoUrl;
    }

    struct ProgramInput {
        string name;
        string picName;
        uint256 target;
        string desc;
        address pic;
        string category;
        string programLink;
        string photoUrl;
    }

    struct History {
        uint256 timestamp;
        string history;
        uint amount;
    }

    address public owner;
    Program[] public programs;
    uint256 public totalManagedFund;
    uint256 public totalAllocated;
    IERC20 public idrxToken;
    mapping(uint256 => History[]) public programHistories;

    // Event dibuat lebih ringkas agar menghindari stack too deep
    event ProgramCreated(uint256 indexed programId, string name, uint256 target, address pic);
    event ProgramUpdated(uint256 indexed programId, string name, string picName);
    event FundSent(address indexed sender, uint256 amount);
    event FundAllocated(uint256 indexed programId, uint256 amount);
    event FundWithdrawn(uint256 indexed programId, address indexed pic, string history, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == owner, "Only Admin can call this function!");
        _;
    }

    modifier onlyPIC(uint256 _programId) {
        require(_programId < programs.length, "Invalid program ID");
        require(msg.sender == programs[_programId].pic, "You are not PIC of this program");
        _;
    }

    constructor(address _tokenAddress) {
        require(_tokenAddress != address(0), "Invalid token address");
        owner = msg.sender;
        idrxToken = IERC20(_tokenAddress);
    }

    function createProgram(ProgramInput calldata input) external onlyAdmin {
        require(bytes(input.name).length > 0, "Program name cannot be empty");
        require(input.target > 0, "Target must be greater than zero");
        require(bytes(input.desc).length > 0, "Description cannot be empty");
        require(input.pic != address(0), "PIC address cannot be zero");
        require(bytes(input.picName).length > 0, "PIC Name cannot be empty");
        require(bytes(input.category).length > 0, "Category cannot be empty");
        require(bytes(input.programLink).length > 0, "Program Link cannot be empty");
        require(bytes(input.photoUrl).length > 0, "Photo Url cannot be empty");

        uint256 newId = programs.length;
        Program memory newProgram = Program({
            id: newId,
            name: input.name,
            picName: input.picName,
            target: input.target,
            desc: input.desc,
            pic: input.pic,
            status: ProgramStatus.REGISTERED,
            allocated: 0,
            category: input.category,
            programLink: input.programLink,
            photoUrl: input.photoUrl
        });

        programs.push(newProgram);

        // Emit event dengan data ringkas untuk menghindari stack too deep
        emit ProgramCreated(newId, input.name, input.target, input.pic);
    }

    function updateProgram(uint256 _programId, ProgramInput calldata input) external onlyAdmin {
        require(_programId < programs.length, "Invalid program ID");
        Program storage program = programs[_programId];
        require(program.status == ProgramStatus.REGISTERED, "Program is not registered");

        require(bytes(input.name).length > 0, "Program name cannot be empty");
        require(bytes(input.desc).length > 0, "Description cannot be empty");
        require(input.pic != address(0), "PIC address cannot be zero");
        require(bytes(input.picName).length > 0, "PIC Name cannot be empty");
        require(bytes(input.category).length > 0, "Category cannot be empty");
        require(bytes(input.programLink).length > 0, "Program Link cannot be empty");
        require(bytes(input.photoUrl).length > 0, "Photo Url cannot be empty");

        program.name = input.name;
        program.desc = input.desc;
        program.picName = input.picName;
        program.pic = input.pic;
        program.category = input.category;
        program.programLink = input.programLink;
        program.photoUrl = input.photoUrl;

        emit ProgramUpdated(_programId, input.name, input.picName);
    }

    function sendFund(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        require(idrxToken.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        totalManagedFund += amount;
        emit FundSent(msg.sender, amount);
    }

    function allocateFund(uint256 _programId) external onlyAdmin {
        require(_programId < programs.length, "Invalid program ID");
        Program storage program = programs[_programId];
        require(program.status == ProgramStatus.REGISTERED, "Program is not registered");
        require(program.allocated == 0, "Program already allocated");

        uint256 available = idrxToken.balanceOf(address(this)) - totalAllocated;
        require(available >= program.target, "Insufficient balance to allocate");

        program.allocated += program.target;
        totalAllocated += program.target;
        program.status = ProgramStatus.ALLOCATED;

        emit FundAllocated(_programId, program.target);
    }

    function withdrawFund(uint256 _programId, string calldata _history, uint256 _amount) external onlyPIC(_programId) {
        require(_programId < programs.length, "Invalid program ID");

        Program storage program = programs[_programId];
        require(program.status == ProgramStatus.ALLOCATED, "Program is not allocated");
        require(bytes(_history).length > 0, "History cannot be empty");
        require(_amount > 0, "Amount must be greater than zero");
        require(_amount <= program.allocated, "Amount exceeds allocated fund");

        program.allocated -= _amount;
        totalAllocated -= _amount;

        programHistories[_programId].push(History({
            timestamp: block.timestamp,
            history: _history,
            amount: _amount
        }));

        require(idrxToken.transfer(msg.sender, _amount), "Token transfer failed");

        emit FundWithdrawn(_programId, msg.sender, _history, _amount);
    }

    function markProgramAsFinished(uint256 _programId) external onlyAdmin {
        require(_programId < programs.length, "Invalid program ID");
        Program storage program = programs[_programId];
        require(program.status == ProgramStatus.ALLOCATED, "Program must be allocated first");
        program.status = ProgramStatus.FINISHED;
    }

    function deactivateProgram(uint256 _programId) external onlyAdmin {
        require(_programId < programs.length, "Invalid program ID");
        Program storage program = programs[_programId];
        require(program.status == ProgramStatus.REGISTERED, "Only registered programs can be deactivated");
        program.status = ProgramStatus.INACTIVE;
    }

    function getAllProgram() external view returns (Program[] memory) {
        return programs;
    }

    function getProgramHistory(uint256 _programId) external view returns (History[] memory) {
        return programHistories[_programId];
    }
}