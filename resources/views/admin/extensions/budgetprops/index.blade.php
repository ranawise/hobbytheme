@extends('layouts.admin')
<?php 
    // Define extension information.
    $EXTENSION_ID = "budgetprops";
    $EXTENSION_NAME = stripslashes("Budget Server Properties");
    $EXTENSION_VERSION = "1.0.0";
    $EXTENSION_DESCRIPTION = stripslashes("Restrict server.properties on budget nodes to max-players only.");
    $EXTENSION_ICON = "/assets/extensions/budgetprops/icon.jpg";
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
    @yield('extension.description')    <style>
        .budgetprops-picker-panel {
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            background: #12141c;
            max-height: 420px;
            overflow-y: auto;
        }
        .budgetprops-picker-toolbar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }
        .budgetprops-picker-toolbar .form-control {
            max-width: 280px;
            background: #1a1d27;
            border-color: rgba(255, 255, 255, 0.12);
            color: #e5e7eb;
        }
        .budgetprops-picker-toolbar .form-control::placeholder {
            color: #6b7280;
        }
        .budgetprops-picker-toolbar .btn-default {
            background: #1a1d27;
            border-color: rgba(255, 255, 255, 0.12);
            color: #e5e7eb;
        }
        .budgetprops-picker-toolbar .btn-default:hover {
            background: #252936;
            border-color: rgba(255, 255, 255, 0.2);
            color: #fff;
        }
        .budgetprops-group {
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding: 12px 14px;
        }
        .budgetprops-group:last-child {
            border-bottom: none;
        }
        .budgetprops-group-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .budgetprops-group-title {
            font-weight: 600;
            font-size: 13px;
            color: #d1d5db;
            margin: 0;
        }
        .budgetprops-group-header .btn-default {
            background: #1a1d27;
            border-color: rgba(255, 255, 255, 0.12);
            color: #cbd5e1;
        }
        .budgetprops-card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 8px;
        }
        .budgetprops-card {
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
        .budgetprops-card:hover {
            border-color: #3c8dbc;
            background: #222633;
        }
        .budgetprops-card.is-selected {
            border-color: #3c8dbc;
            background: rgba(60, 141, 188, 0.18);
            box-shadow: 0 0 0 1px rgba(60, 141, 188, 0.35);
        }
        .budgetprops-card input[type="checkbox"] {
            position: static !important;
            margin: 3px 0 0 !important;
            float: none !important;
            flex-shrink: 0;
            accent-color: #3c8dbc;
        }
        .budgetprops-card-body {
            flex: 1;
            min-width: 0;
        }
        .budgetprops-card-name {
            display: block;
            font-weight: 600;
            color: #f3f4f6;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .budgetprops-card-meta {
            display: block;
            font-size: 12px;
            color: #9ca3af;
            margin-top: 2px;
        }
        .budgetprops-selected-summary {
            margin-top: 14px;
            padding-top: 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .budgetprops-selected-summary strong {
            color: #e5e7eb;
        }
        .budgetprops-selected-summary .label {
            display: inline-block;
            margin: 0 6px 6px 0;
            font-size: 12px;
            font-weight: normal;
            padding: 5px 8px;
            background: #2a3142 !important;
            color: #e5e7eb !important;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .budgetprops-selected-summary .text-muted {
            color: #9ca3af !important;
        }
        .budgetprops-empty-search {
            padding: 24px;
            text-align: center;
            color: #9ca3af;
            display: none;
        }
        .budgetprops-card.is-hidden,
        .budgetprops-group.is-hidden {
            display: none !important;
        }
        #budgetprops-form .help-block {
            color: #9ca3af;
        }
        #budgetprops-form #max_players_limit {
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
                    Servers on <strong>budget nodes</strong> using the selected <strong>Minecraft eggs</strong> cannot edit
                    <code>server.properties</code> in the file manager. Users may only change <strong>max-players</strong>
                    (1–{{ $max_players_limit }}) from the <em>Server Properties</em> tab.
                </p>
                <p class="text-muted" style="margin-bottom: 0;">
                    After saving, restart affected Minecraft servers so Wings applies the file denylist.
                </p>
            </div>
        </div>
    </div>

    <form method="post" action="{{ $root }}" id="budgetprops-form">
        @csrf
        @method('PATCH')

        <div class="row">
            <div class="col-lg-8">
                <div class="box box-primary">
                    <div class="box-header with-border clearfix">
                        <h3 class="box-title"><i class="fa fa-server"></i> Budget nodes</h3>
                        <div class="box-tools pull-right">
                            <span class="label label-primary" id="budgetprops-node-count">{{ count($budget_node_ids) }} selected</span>
                        </div>
                    </div>
                    <div class="box-body">
                        <p class="text-muted">
                            Click nodes to toggle them. All servers on selected nodes are subject to restrictions when they use a selected egg below.
                        </p>

                        <div class="budgetprops-picker-toolbar">
                            <input
                                type="search"
                                id="budgetprops-node-search"
                                class="form-control"
                                placeholder="Search by node name, FQDN, or location..."
                                autocomplete="off"
                            >
                            <button type="button" class="btn btn-sm btn-default" id="budgetprops-node-select-all">
                                <i class="fa fa-check-square-o"></i> Select all
                            </button>
                            <button type="button" class="btn btn-sm btn-default" id="budgetprops-node-select-none">
                                <i class="fa fa-square-o"></i> Clear all
                            </button>
                        </div>

                        @if ($nodes->isEmpty())
                            <p class="text-muted text-center" style="padding: 24px 0;">No nodes found on this panel.</p>
                        @else
                            <div class="budgetprops-picker-panel" id="budgetprops-node-panel">
                                @php $groupedNodes = $nodes->groupBy(fn ($node) => $node->location_id ?? 0); @endphp
                                @foreach ($groupedNodes as $locationNodes)
                                    @php
                                        $location = $locationNodes->first()->location;
                                        $locationLabel = $location
                                            ? ($location->short . ($location->long ? ' — ' . $location->long : ''))
                                            : 'Unassigned location';
                                    @endphp
                                    <div class="budgetprops-group" data-group-label="{{ strtolower($locationLabel) }}">
                                        <div class="budgetprops-group-header">
                                            <p class="budgetprops-group-title">
                                                <i class="fa fa-map-marker text-muted"></i> {{ $locationLabel }}
                                            </p>
                                            <button type="button" class="btn btn-xs btn-default budgetprops-node-group-toggle">Select group</button>
                                        </div>
                                        <div class="budgetprops-card-grid">
                                            @foreach ($locationNodes as $node)
                                                @php $isSelected = in_array($node->id, $budget_node_ids, true); @endphp
                                                <label
                                                    class="budgetprops-card budgetprops-node-card{{ $isSelected ? ' is-selected' : '' }}"
                                                    data-search="{{ strtolower($node->name . ' ' . $node->fqdn . ' ' . $locationLabel . ' ' . $node->id) }}"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name="budget_node_ids[]"
                                                        value="{{ $node->id }}"
                                                        @if($isSelected) checked @endif
                                                    >
                                                    <span class="budgetprops-card-body">
                                                        <span class="budgetprops-card-name">{{ $node->name }}</span>
                                                        <span class="budgetprops-card-meta">
                                                            #{{ $node->id }} · {{ $node->fqdn }} · {{ $node->servers_count }} {{ $node->servers_count === 1 ? 'server' : 'servers' }}
                                                        </span>
                                                    </span>
                                                </label>
                                            @endforeach
                                        </div>
                                    </div>
                                @endforeach
                                <div class="budgetprops-empty-search" id="budgetprops-node-empty">
                                    <i class="fa fa-search"></i> No nodes match your search.
                                </div>
                            </div>

                            <div class="budgetprops-selected-summary">
                                <strong>Selected nodes</strong>
                                <div id="budgetprops-node-tags" style="margin-top: 8px;">
                                    @forelse ($selected_nodes as $node)
                                        <span class="label label-default">#{{ $node->id }} {{ $node->name }}</span>
                                    @empty
                                        <span class="text-muted" id="budgetprops-node-none">None selected — restrictions apply only after you pick at least one node.</span>
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
                        <h3 class="box-title"><i class="fa fa-users"></i> Player limit</h3>
                    </div>
                    <div class="box-body">
                        <div class="form-group">
                            <label for="max_players_limit" class="control-label">Maximum players allowed</label>
                            <input
                                type="number"
                                name="max_players_limit"
                                id="max_players_limit"
                                class="form-control input-lg"
                                min="1"
                                max="100"
                                value="{{ $max_players_limit }}"
                            >
                            <p class="help-block" style="margin-bottom: 0;">
                                Users cannot set max-players above this value on budget servers (default: 10).
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
                            <span class="label label-primary" id="budgetprops-egg-count">{{ count($egg_ids) }} selected</span>
                        </div>
                    </div>
                    <div class="box-body">
                        <p class="text-muted">
                            Click eggs to toggle them. Only servers using these templates on budget nodes show the <em>Server Properties</em> page and receive file restrictions.
                        </p>

                        <div class="budgetprops-picker-toolbar">
                            <input
                                type="search"
                                id="budgetprops-egg-search"
                                class="form-control"
                                placeholder="Search by egg or nest name..."
                                autocomplete="off"
                            >
                            <button type="button" class="btn btn-sm btn-default" id="budgetprops-egg-select-all">
                                <i class="fa fa-check-square-o"></i> Select all
                            </button>
                            <button type="button" class="btn btn-sm btn-default" id="budgetprops-egg-select-none">
                                <i class="fa fa-square-o"></i> Clear all
                            </button>
                        </div>

                        @if ($nests->isEmpty())
                            <p class="text-muted text-center" style="padding: 24px 0;">No nests found on this panel.</p>
                        @else
                            <div class="budgetprops-picker-panel" id="budgetprops-egg-panel">
                                @foreach ($nests as $nest)
                                    @if ($nest->eggs->isEmpty())
                                        @continue
                                    @endif
                                    <div class="budgetprops-group" data-group-label="{{ strtolower($nest->name) }}">
                                        <div class="budgetprops-group-header">
                                            <p class="budgetprops-group-title">
                                                <i class="fa fa-cube text-muted"></i> {{ $nest->name }}
                                            </p>
                                            <button type="button" class="btn btn-xs btn-default budgetprops-egg-group-toggle">Select group</button>
                                        </div>
                                        <div class="budgetprops-card-grid">
                                            @foreach ($nest->eggs as $egg)
                                                @php $eggSelected = in_array($egg->id, $egg_ids, true); @endphp
                                                <label
                                                    class="budgetprops-card budgetprops-egg-card{{ $eggSelected ? ' is-selected' : '' }}"
                                                    data-search="{{ strtolower($egg->name . ' ' . $nest->name . ' ' . $egg->id) }}"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name="egg_ids[]"
                                                        value="{{ $egg->id }}"
                                                        @if($eggSelected) checked @endif
                                                    >
                                                    <span class="budgetprops-card-body">
                                                        <span class="budgetprops-card-name">{{ $egg->name }}</span>
                                                        <span class="budgetprops-card-meta">#{{ $egg->id }} · {{ $nest->name }}</span>
                                                    </span>
                                                </label>
                                            @endforeach
                                        </div>
                                    </div>
                                @endforeach
                                <div class="budgetprops-empty-search" id="budgetprops-egg-empty">
                                    <i class="fa fa-search"></i> No eggs match your search.
                                </div>
                            </div>

                            <div class="budgetprops-selected-summary">
                                <strong>Selected eggs</strong>
                                <div id="budgetprops-egg-tags" style="margin-top: 8px;">
                                    @forelse ($selected_eggs as $egg)
                                        <span class="label label-default">{{ $egg->nest->name }} · {{ $egg->name }}</span>
                                    @empty
                                        <span class="text-muted" id="budgetprops-egg-none">None selected — defaults to all Minecraft eggs on save if left empty.</span>
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
                var selectAll = options.selectAll;
                var selectNone = options.selectNone;
                var groupToggle = options.groupToggle;
                var noneHtml = options.noneHtml;
                var tagBuilder = options.tagBuilder;

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

                    $panel.find('.budgetprops-group').each(function () {
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

                $(selectAll).on('click', function () {
                    $panel.find('.' + cardClass + ':not(.is-hidden) input[name="' + inputName + '"]').prop('checked', true);
                    updateSelectedState();
                });

                $(selectNone).on('click', function () {
                    $panel.find('input[name="' + inputName + '"]').prop('checked', false);
                    updateSelectedState();
                });

                $panel.on('click', groupToggle, function () {
                    $(this).closest('.budgetprops-group').find('.' + cardClass + ':not(.is-hidden) input[name="' + inputName + '"]').prop('checked', true);
                    updateSelectedState();
                });

                updateSelectedState();
            }

            initPicker({
                panel: '#budgetprops-node-panel',
                search: '#budgetprops-node-search',
                count: '#budgetprops-node-count',
                tags: '#budgetprops-node-tags',
                empty: '#budgetprops-node-empty',
                inputName: 'budget_node_ids[]',
                cardClass: 'budgetprops-node-card',
                selectAll: '#budgetprops-node-select-all',
                selectNone: '#budgetprops-node-select-none',
                groupToggle: '.budgetprops-node-group-toggle',
                noneHtml: '<span class="text-muted" id="budgetprops-node-none">None selected — restrictions apply only after you pick at least one node.</span>',
                tagBuilder: function ($input) {
                    var $card = $input.closest('.budgetprops-node-card');
                    var name = $card.find('.budgetprops-card-name').text();
                    return '<span class="label label-default">#' + $input.val() + ' ' + $('<div>').text(name).html() + '</span>';
                }
            });

            initPicker({
                panel: '#budgetprops-egg-panel',
                search: '#budgetprops-egg-search',
                count: '#budgetprops-egg-count',
                tags: '#budgetprops-egg-tags',
                empty: '#budgetprops-egg-empty',
                inputName: 'egg_ids[]',
                cardClass: 'budgetprops-egg-card',
                selectAll: '#budgetprops-egg-select-all',
                selectNone: '#budgetprops-egg-select-none',
                groupToggle: '.budgetprops-egg-group-toggle',
                noneHtml: '<span class="text-muted" id="budgetprops-egg-none">None selected — defaults to all Minecraft eggs on save if left empty.</span>',
                tagBuilder: function ($input) {
                    var $card = $input.closest('.budgetprops-egg-card');
                    var name = $card.find('.budgetprops-card-name').text();
                    var meta = $card.find('.budgetprops-card-meta').text();
                    return '<span class="label label-default">' + $('<div>').text(meta + ' ' + name).html() + '</span>';
                }
            });
        });
    </script>
@endsection
