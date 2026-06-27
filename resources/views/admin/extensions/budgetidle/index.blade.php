@extends('layouts.admin')
<?php 
    // Define extension information.
    $EXTENSION_ID = "budgetidle";
    $EXTENSION_NAME = stripslashes("Budget Idle Shutdown");
    $EXTENSION_VERSION = "1.0.0";
    $EXTENSION_DESCRIPTION = stripslashes("Stop budget Minecraft servers when all players have left.");
    $EXTENSION_ICON = "/assets/extensions/budgetidle/icon.jpg";
    $EXTENSION_WEBSITE = "[website]";
    $EXTENSION_WEBICON = "[webicon]";
?>
@include('blueprint.admin.template')

@section('title')
    {{ $EXTENSION_NAME }}
@endsection

@section('content-header')
    @yield('extension.header')
@endsection

@section('content')
    @yield('extension.config')
    @yield('extension.description')        .budgetidle-picker-panel {
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            background: #12141c;
            max-height: 420px;
            overflow-y: auto;
        }
        .budgetidle-picker-toolbar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }
        .budgetidle-picker-toolbar .form-control {
            max-width: 280px;
            background: #1a1d27;
            border-color: rgba(255, 255, 255, 0.12);
            color: #e5e7eb;
        }
        .budgetidle-picker-toolbar .form-control::placeholder {
            color: #6b7280;
        }
        .budgetidle-picker-toolbar .btn-default {
            background: #1a1d27;
            border-color: rgba(255, 255, 255, 0.12);
            color: #e5e7eb;
        }
        .budgetidle-picker-toolbar .btn-default:hover {
            background: #252936;
            border-color: rgba(255, 255, 255, 0.2);
            color: #fff;
        }
        .budgetidle-group {
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding: 12px 14px;
        }
        .budgetidle-group:last-child {
            border-bottom: none;
        }
        .budgetidle-group-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .budgetidle-group-title {
            font-weight: 600;
            font-size: 13px;
            color: #d1d5db;
            margin: 0;
        }
        .budgetidle-group-header .btn-default {
            background: #1a1d27;
            border-color: rgba(255, 255, 255, 0.12);
            color: #cbd5e1;
        }
        .budgetidle-card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 8px;
        }
        .budgetidle-card {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin: 0;
            padding: 10px 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            background: #1a1d27;
            cursor: pointer;
            transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
        }
        .budgetidle-card:hover {
            border-color: #3c8dbc;
            background: #222633;
        }
        .budgetidle-card.is-selected {
            border-color: #3c8dbc;
            background: rgba(60, 141, 188, 0.18);
            box-shadow: 0 0 0 1px rgba(60, 141, 188, 0.35);
        }
        .budgetidle-card input[type="checkbox"] {
            position: static !important;
            margin: 3px 0 0 !important;
            float: none !important;
            flex-shrink: 0;
            accent-color: #3c8dbc;
        }
        .budgetidle-card-body {
            flex: 1;
            min-width: 0;
        }
        .budgetidle-card-name {
            display: block;
            font-weight: 600;
            color: #f3f4f6;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .budgetidle-card-meta {
            display: block;
            font-size: 12px;
            color: #9ca3af;
            margin-top: 2px;
        }
        .budgetidle-selected-summary {
            margin-top: 14px;
            padding-top: 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .budgetidle-selected-summary strong {
            color: #e5e7eb;
        }
        .budgetidle-selected-summary .label {
            display: inline-block;
            margin: 0 6px 6px 0;
            font-size: 12px;
            font-weight: normal;
            padding: 5px 8px;
            background: #2a3142 !important;
            color: #e5e7eb !important;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .budgetidle-selected-summary .text-muted {
            color: #9ca3af !important;
        }
        .budgetidle-empty-search {
            padding: 24px;
            text-align: center;
            color: #9ca3af;
            display: none;
        }
        .budgetidle-card.is-hidden,
        .budgetidle-group.is-hidden {
            display: none !important;
        }
        #budgetidle-form .help-block {
            color: #9ca3af;
        }
        .budgetidle-enable-label {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 0;
            padding: 12px 14px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            background: #1a1d27;
            cursor: pointer;
            font-weight: 600;
            color: #e5e7eb;
            width: 100%;
            box-sizing: border-box;
        }
        .budgetidle-enable-label input[type="checkbox"] {
            position: static !important;
            margin: 0 !important;
            float: none !important;
            flex-shrink: 0;
            width: 16px;
            height: 16px;
            accent-color: #3c8dbc;
        }
        .budgetidle-enable-label span {
            line-height: 1.4;
        }
        #budgetidle-form #idle_minutes {
            background: #1a1d27;
            border-color: rgba(255, 255, 255, 0.12);
            color: #f3f4f6;
        }
    </style>

    <div class="row">
        <div class="col-xs-12">
            <div class="callout callout-info">
                <h4>How it works</h4>
                <p>
                    For servers on <strong>budget nodes</strong> using the selected <strong>Minecraft eggs</strong>, the panel
                    checks every <strong>30 seconds</strong> whether anyone is online. When a running server has
                    <strong>zero players</strong>, a shutdown timer starts. If nobody joins before the idle time below expires,
                    the server is sent a graceful <strong>stop</strong> signal.
                </p>
                <p class="text-muted" style="margin-bottom: 0;">
                    Player counts use the Minecraft server list ping. Servers that cannot be queried are skipped until the next run.
                </p>
            </div>
        </div>
    </div>

    <form method="post" action="{{ $root }}" id="budgetidle-form">
        @csrf
        @method('PATCH')

        <div class="row">
            <div class="col-lg-8">
                <div class="box box-primary">
                    <div class="box-header with-border clearfix">
                        <h3 class="box-title"><i class="fa fa-server"></i> Budget nodes</h3>
                        <div class="box-tools pull-right">
                            <span class="label label-primary" id="budgetidle-node-count">{{ count($budget_node_ids) }} selected</span>
                        </div>
                    </div>
                    <div class="box-body">
                        <p class="text-muted">
                            Click nodes to toggle them. Only running servers on selected nodes are checked for idle shutdown.
                        </p>

                        <div class="budgetidle-picker-toolbar">
                            <input
                                type="search"
                                id="budgetidle-node-search"
                                class="form-control"
                                placeholder="Search by node name, FQDN, or location..."
                                autocomplete="off"
                            >
                            <button type="button" class="btn btn-sm btn-default" id="budgetidle-node-select-all">
                                <i class="fa fa-check-square-o"></i> Select all
                            </button>
                            <button type="button" class="btn btn-sm btn-default" id="budgetidle-node-select-none">
                                <i class="fa fa-square-o"></i> Clear all
                            </button>
                        </div>

                        @if ($nodes->isEmpty())
                            <p class="text-muted text-center" style="padding: 24px 0;">No nodes found on this panel.</p>
                        @else
                            <div class="budgetidle-picker-panel" id="budgetidle-node-panel">
                                @php $groupedNodes = $nodes->groupBy(fn ($node) => $node->location_id ?? 0); @endphp
                                @foreach ($groupedNodes as $locationNodes)
                                    @php
                                        $location = $locationNodes->first()->location;
                                        $locationLabel = $location
                                            ? ($location->short . ($location->long ? ' — ' . $location->long : ''))
                                            : 'Unassigned location';
                                    @endphp
                                    <div class="budgetidle-group" data-group-label="{{ strtolower($locationLabel) }}">
                                        <div class="budgetidle-group-header">
                                            <p class="budgetidle-group-title">
                                                <i class="fa fa-map-marker text-muted"></i> {{ $locationLabel }}
                                            </p>
                                            <button type="button" class="btn btn-xs btn-default budgetidle-node-group-toggle">Select group</button>
                                        </div>
                                        <div class="budgetidle-card-grid">
                                            @foreach ($locationNodes as $node)
                                                @php $isSelected = in_array($node->id, $budget_node_ids, true); @endphp
                                                <label
                                                    class="budgetidle-card budgetidle-node-card{{ $isSelected ? ' is-selected' : '' }}"
                                                    data-search="{{ strtolower($node->name . ' ' . $node->fqdn . ' ' . $locationLabel . ' ' . $node->id) }}"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name="budget_node_ids[]"
                                                        value="{{ $node->id }}"
                                                        @if($isSelected) checked @endif
                                                    >
                                                    <span class="budgetidle-card-body">
                                                        <span class="budgetidle-card-name">{{ $node->name }}</span>
                                                        <span class="budgetidle-card-meta">
                                                            #{{ $node->id }} · {{ $node->fqdn }} · {{ $node->servers_count }} {{ $node->servers_count === 1 ? 'server' : 'servers' }}
                                                        </span>
                                                    </span>
                                                </label>
                                            @endforeach
                                        </div>
                                    </div>
                                @endforeach
                                <div class="budgetidle-empty-search" id="budgetidle-node-empty">
                                    <i class="fa fa-search"></i> No nodes match your search.
                                </div>
                            </div>

                            <div class="budgetidle-selected-summary">
                                <strong>Selected nodes</strong>
                                <div id="budgetidle-node-tags" style="margin-top: 8px;">
                                    @forelse ($selected_nodes as $node)
                                        <span class="label label-default">#{{ $node->id }} {{ $node->name }}</span>
                                    @empty
                                        <span class="text-muted" id="budgetidle-node-none">None selected — idle shutdown will not run until you pick at least one node.</span>
                                    @endforelse
                                </div>
                            </div>
                        @endif
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="box box-primary">
                    <div class="box-header with-border">
                        <h3 class="box-title"><i class="fa fa-cog"></i> Settings</h3>
                    </div>
                    <div class="box-body">
                        <div class="form-group" style="margin-bottom: 16px;">
                            <input type="hidden" name="enabled" value="0">
                            <label class="budgetidle-enable-label">
                                <input type="checkbox" name="enabled" value="1" @if($enabled) checked @endif>
                                <span>Enable automatic shutdown when empty</span>
                            </label>
                            <p class="help-block" style="margin-top: 8px; margin-bottom: 0;">When off, the scheduled job skips all servers even if nodes are selected.</p>
                        </div>

                        <div class="form-group">
                            <label for="idle_minutes" class="control-label">Idle time (minutes)</label>
                            <input
                                type="number"
                                name="idle_minutes"
                                id="idle_minutes"
                                class="form-control input-lg"
                                min="1"
                                max="120"
                                value="{{ $idle_minutes }}"
                            >
                            <p class="help-block">
                                Empty-server timer length (1–120 minutes). Checked every 30 seconds; a player joining resets the timer.
                            </p>
                        </div>

                        <div class="callout callout-warning" style="margin-bottom: 0; padding: 10px 12px;">
                            <p style="margin: 0; font-size: 13px;">
                                <i class="fa fa-clock-o"></i> Checks every 30 seconds. Your panel cron must run <code>schedule:run</code> every minute <em>and</em> with a 30s offset, for example:<br>
                                <code>* * * * * php artisan schedule:run</code><br>
                                <code>* * * * * sleep 30; php artisan schedule:run</code>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-xs-12">
                <div class="box box-primary">
                    <div class="box-header with-border clearfix">
                        <h3 class="box-title"><i class="fa fa-egg"></i> Minecraft eggs</h3>
                        <div class="box-tools pull-right">
                            <span class="label label-primary" id="budgetidle-egg-count">{{ count($egg_ids) }} selected</span>
                        </div>
                    </div>
                    <div class="box-body">
                        <p class="text-muted">
                            Click eggs to toggle them. Only servers using these templates on selected budget nodes are checked.
                        </p>

                        <div class="budgetidle-picker-toolbar">
                            <input
                                type="search"
                                id="budgetidle-egg-search"
                                class="form-control"
                                placeholder="Search by egg or nest name..."
                                autocomplete="off"
                            >
                            <button type="button" class="btn btn-sm btn-default" id="budgetidle-egg-select-all">
                                <i class="fa fa-check-square-o"></i> Select all
                            </button>
                            <button type="button" class="btn btn-sm btn-default" id="budgetidle-egg-select-none">
                                <i class="fa fa-square-o"></i> Clear all
                            </button>
                        </div>

                        @if ($nests->isEmpty())
                            <p class="text-muted text-center" style="padding: 24px 0;">No nests found on this panel.</p>
                        @else
                            <div class="budgetidle-picker-panel" id="budgetidle-egg-panel">
                                @foreach ($nests as $nest)
                                    @if ($nest->eggs->isEmpty())
                                        @continue
                                    @endif
                                    <div class="budgetidle-group" data-group-label="{{ strtolower($nest->name) }}">
                                        <div class="budgetidle-group-header">
                                            <p class="budgetidle-group-title">
                                                <i class="fa fa-cube text-muted"></i> {{ $nest->name }}
                                            </p>
                                            <button type="button" class="btn btn-xs btn-default budgetidle-egg-group-toggle">Select group</button>
                                        </div>
                                        <div class="budgetidle-card-grid">
                                            @foreach ($nest->eggs as $egg)
                                                @php $eggSelected = in_array($egg->id, $egg_ids, true); @endphp
                                                <label
                                                    class="budgetidle-card budgetidle-egg-card{{ $eggSelected ? ' is-selected' : '' }}"
                                                    data-search="{{ strtolower($egg->name . ' ' . $nest->name . ' ' . $egg->id) }}"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name="egg_ids[]"
                                                        value="{{ $egg->id }}"
                                                        @if($eggSelected) checked @endif
                                                    >
                                                    <span class="budgetidle-card-body">
                                                        <span class="budgetidle-card-name">{{ $egg->name }}</span>
                                                        <span class="budgetidle-card-meta">#{{ $egg->id }} · {{ $nest->name }}</span>
                                                    </span>
                                                </label>
                                            @endforeach
                                        </div>
                                    </div>
                                @endforeach
                                <div class="budgetidle-empty-search" id="budgetidle-egg-empty">
                                    <i class="fa fa-search"></i> No eggs match your search.
                                </div>
                            </div>

                            <div class="budgetidle-selected-summary">
                                <strong>Selected eggs</strong>
                                <div id="budgetidle-egg-tags" style="margin-top: 8px;">
                                    @forelse ($selected_eggs as $egg)
                                        <span class="label label-default">{{ $egg->nest->name }} · {{ $egg->name }}</span>
                                    @empty
                                        <span class="text-muted" id="budgetidle-egg-none">None selected — defaults to all Minecraft eggs on save if left empty.</span>
                                    @endforelse
                                </div>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-xs-12">
                <button type="submit" class="btn btn-primary btn-lg">
                    <i class="fa fa-save"></i> Save configuration
                </button>
            </div>
        </div>
    </form>

    <script>
        $(function () {
            function initPicker(options) {
                var $panel = $(options.panel);
                var $search = $(options.search);
                var $count = $(options.count);
                var $tags = $(options.tags);
                var $empty = $(options.empty);
                var inputName = options.inputName;
                var cardClass = options.cardClass;
                var nameSelector = options.nameSelector;
                var tagBuilder = options.tagBuilder;
                var noneHtml = options.noneHtml;

                function updateSelectedState() {
                    var count = $panel.find('input[name="' + inputName + '"]:checked').length;
                    $count.text(count + ' selected');

                    $panel.find('.' + cardClass).each(function () {
                        var $card = $(this);
                        $card.toggleClass('is-selected', $card.find('input[type="checkbox"]').is(':checked'));
                    });

                    var tags = [];
                    $panel.find('input[name="' + inputName + '"]:checked').each(function () {
                        tags.push(tagBuilder($(this)));
                    });

                    $tags.html(tags.length ? tags.join('') : noneHtml);
                }

                function filterItems(query) {
                    query = (query || '').toLowerCase().trim();
                    var visibleCards = 0;

                    $panel.find('.budgetidle-group').each(function () {
                        var $group = $(this);
                        var groupVisible = 0;
                        var groupLabel = $group.data('group-label') || '';

                        $group.find('.' + cardClass).each(function () {
                            var $card = $(this);
                            var haystack = $card.data('search') || '';
                            var match = !query || haystack.indexOf(query) !== -1 || groupLabel.indexOf(query) !== -1;
                            $card.toggleClass('is-hidden', !match);
                            if (match) {
                                groupVisible++;
                                visibleCards++;
                            }
                        });

                        $group.toggleClass('is-hidden', groupVisible === 0);
                    });

                    $empty.toggle(visibleCards === 0 && query.length > 0);
                }

                $panel.on('change', 'input[name="' + inputName + '"]', updateSelectedState);
                $search.on('input', function () { filterItems($(this).val()); });

                $(options.selectAll).on('click', function () {
                    $panel.find('.' + cardClass + ':not(.is-hidden) input[name="' + inputName + '"]').prop('checked', true);
                    updateSelectedState();
                });

                $(options.selectNone).on('click', function () {
                    $panel.find('input[name="' + inputName + '"]').prop('checked', false);
                    updateSelectedState();
                });

                $panel.on('click', options.groupToggle, function () {
                    $(this).closest('.budgetidle-group').find('.' + cardClass + ':not(.is-hidden) input[name="' + inputName + '"]').prop('checked', true);
                    updateSelectedState();
                });

                updateSelectedState();
            }

            initPicker({
                panel: '#budgetidle-node-panel',
                search: '#budgetidle-node-search',
                count: '#budgetidle-node-count',
                tags: '#budgetidle-node-tags',
                empty: '#budgetidle-node-empty',
                inputName: 'budget_node_ids[]',
                cardClass: 'budgetidle-node-card',
                nameSelector: '.budgetidle-card-name',
                selectAll: '#budgetidle-node-select-all',
                selectNone: '#budgetidle-node-select-none',
                groupToggle: '.budgetidle-node-group-toggle',
                noneHtml: '<span class="text-muted" id="budgetidle-node-none">None selected — idle shutdown will not run until you pick at least one node.</span>',
                tagBuilder: function ($input) {
                    var $card = $input.closest('.budgetidle-node-card');
                    var name = $card.find('.budgetidle-card-name').text();
                    return '<span class="label label-default">#' + $input.val() + ' ' + $('<div>').text(name).html() + '</span>';
                }
            });

            initPicker({
                panel: '#budgetidle-egg-panel',
                search: '#budgetidle-egg-search',
                count: '#budgetidle-egg-count',
                tags: '#budgetidle-egg-tags',
                empty: '#budgetidle-egg-empty',
                inputName: 'egg_ids[]',
                cardClass: 'budgetidle-egg-card',
                nameSelector: '.budgetidle-card-name',
                selectAll: '#budgetidle-egg-select-all',
                selectNone: '#budgetidle-egg-select-none',
                groupToggle: '.budgetidle-egg-group-toggle',
                noneHtml: '<span class="text-muted" id="budgetidle-egg-none">None selected — defaults to all Minecraft eggs on save if left empty.</span>',
                tagBuilder: function ($input) {
                    var $card = $input.closest('.budgetidle-egg-card');
                    var name = $card.find('.budgetidle-card-name').text();
                    var meta = $card.find('.budgetidle-card-meta').text();
                    return '<span class="label label-default">' + $('<div>').text(meta + ' ' + name).html() + '</span>';
                }
            });
        });
    </script>
@endsection
